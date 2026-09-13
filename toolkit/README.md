# `fbk-pack` — the extension toolkit

Builds and checks a Folienbaukasten extension. **It needs no checkout of the
app.**

```sh
node ../toolkit/bin/fbk-pack.ts check .     # everything knowable before install
node ../toolkit/bin/fbk-pack.ts pack .      # → dist/<id>-<version>.fbkset
node ../toolkit/bin/fbk-pack.ts abi         # what platform this toolkit targets
```

Every extension in this repo calls it through its own `npm run pack` /
`npm run check`.

How this fits together, and how to build and publish an extension end to
end, is [the repository README](../README.md).

## Why it exists

Packaging used to run out of the app's source tree: the packer, the runtime
shims, the pack format's rules and the theme token contract all lived there,
so building a `.fbkset` meant having the app checked out at a path your
`tsconfig.json` knew about. That is the wrong dependency. An extension is
built against a **published platform**, not against someone's working copy —
and an extension author is not necessarily an app developer.

So the parts a packer needs are emitted from the app as data and checked in
here, under [`abi/`](abi/README.md):

| In the bundle | What it is |
| --- | --- |
| `abi.json` | ABI major, pack format, the design tokens a theme owes, the named box styles, the swatch tokens, the platform's exports, the layout vocabulary, the built-in theme ids |
| `pack.js` / `pack.d.ts` | the app's own `src/sets/pack.ts`, compiled — so the manifest rules enforced here are the *same code* the app runs at install, not a second implementation that can disagree |
| `shims/*.js` | the `react`, `react/jsx-runtime` and `@folienbaukasten/platform` shims a pack is built against |
| `types/` | declarations for `@folienbaukasten/platform`, so `tsconfig.json` maps the platform at the ABI rather than at a path into the app |
| `provenance.json` | which app build emitted the bundle — for a person, never read to decide anything, and excluded from the drift check so that check fires on a changed *contract* rather than on a changed commit |

Refresh it from the app repo, whose `npm run check` also fails if this copy
has drifted from what it would emit:

```sh
cd <app repo> && npm run abi:emit
```

## What `check` checks

Packing runs all of it first: a pack that would not install is not written.
Everything is reported in one pass — a tool that reports one problem per
attempt is how an extension author gives up.

**The manifest** — id shape, an id that shadows no built-in theme, semver,
the declared platform ABI, template ids, `provides`, and component kinds
namespaced by the pack id. This is `manifestProblems` from the bundle: the
function the app runs at install time.

**The theme contract** — every custom property the platform reads without a
fallback, and all ten named box styles. *Nothing checked this for an
out-of-repo theme before.* A missing token silently degraded the rendering,
on the user's machine, with no message anywhere. A missing swatch is a
warning: the theme installs, the chooser just shows it without its palette.

**The components** —

- each `schemaType` resolves and generates a JSON Schema from the author's
  TypeScript;
- each `example` validates against the schema generated from its own type —
  a pack whose own example fails its own schema does not build;
- each `glyph` exists, is an SVG, and is under 16 KB;
- `pack.json` and `index.ts` agree: no kind declared but unregistered (the
  app would offer the slide type and then blank the body), none registered
  but undeclared (no description, schema or glyph — so the model never writes
  it), no `webOnly` that differs between the two (a web-only component
  declared PPTX-safe exports as a silently blank region), and the set's own
  `id` equal to the pack's.

That last group needs the built module, so `check` builds one into a
temporary file and imports it with a stand-in for the set runtime. If the
module's top-level code throws, the group degrades to a warning rather than
blocking the pack.

**Intent** — warnings, not errors: a theme without `production: true`
installs but never appears in the chooser; a pack without a `publisher` gives
the install dialog no name to show; a template naming another theme opens in
that other theme.

## What it does not do

Rendering. Screenshots, PPTX export and installing into a running app all go
through the app itself:

```sh
PPT_SETS_ROOT=$PWD/.dev-sets node <app>/tools/install-set.ts dist/<pack>.fbkset
PPT_SETS_ROOT=$PWD/.dev-sets node <app>/tools/export.ts --deck templates/x.json --out out/deck.pptx
```

That is the honest split: *packaging* is a contract, and the contract is in
this repo; *rendering* is the app, and only the app has it.

## Reproducibility

Two builds of an unchanged extension are byte-identical: file dates are
fixed, and no directory entries are written (JSZip stamps those with the
current time whatever date you ask for — which is what used to make packs
differ run to run; install skips directory entries anyway).

The dependency versions in `package.json` are pinned to the ones the app's
packer used, `esbuild` above all: a different minifier is a different
`set.js`. Every extension in this repo was migrated onto this toolkit and
verified to produce byte-identical pack contents.
