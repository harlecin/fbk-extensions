<div align="center">
 <img src="https://github.com/harlecin/fbk-extensions/blob/main/assets/logo.png?raw=true" width="250" height="250">
 <p><strong>Develop Folien Baukasten Extensions</strong></p>
</div>


An **extension** adds your own design, your own slide types, components and optionally starter decks to showcase everything and teach LLMs how to use your extension to the
[Folien Baukasten](https://christoph.bodner.deno.net/folienbaukasten) slide app. You build it into a
single file — `my-extension-1.0.0.fbkset` — and anyone who has the app
installs it by double-clicking that file.

This repository holds the tools for building one, plus a complete working
example to copy.

| Directory | What it is |
| --- | --- |
| [`sample-extension/`](sample-extension/README.md) | **Start here.** A finished extension that builds and runs: a design, two slide types, two starter decks. Every non-obvious line is commented. |
| [`toolkit/`](toolkit/README.md) | `@folienbaukasten/extension-toolkit` — `fbk-pack`, which builds and checks your extension |
| [`create-extension/`](create-extension/) | `@folienbaukasten/create-extension` — the wizard that sets a new project up |

You need **Node 20+**, and the app itself if you want to look at your work.

## Start here

```sh
npx @folienbaukasten/create-extension my-extension
cd my-extension
npm install
npm run check      # every compatibility check, in one pass
npm run pack       # → dist/my-extension-1.0.0.fbkset
```

Then double-click the file that produced. The app installs it.

The wizard asks five questions, and **only the first one is permanent**: the
npm package name. Your extension's internal id is derived from it —
`@acme/deepseam-extension` becomes `acme.deepseam` — and every presentation
anyone writes with your extension records that id for as long as the file
exists. Publishing the npm name is what makes the id yours: the scope belongs
to your npm account, so nobody else can ship something that collides with it.

Every answer is also a command-line flag, so the wizard can be run from a
script:

```sh
npx @folienbaukasten/create-extension my-extension \
  --package @acme/deepseam-extension \
  --name "Deep Seam" --publisher "Acme GmbH" --provides both
```

## What an extension can add

Two things, and either one on its own is fine:

- **A design** — colours, type and spacing, plus the header and footer of
  every slide. Without your extension a presentation still opens; it just
  looks like the default design.
- **Components** — your own React components, each going into the *body* of a
  slide. Without your extension those slides show an "install this extension"
  placeholder instead.

An extension **cannot add a slide layout**. Layouts belong to the app, which
is what lets every presentation render under every design — including designs
written by people who never saw that presentation. Your component is handed a
box and owns what is inside it; it cannot touch the header and footer bands or
push them off the page.

## The development loop

```sh
npm run check                      # run this before anything else
npm run pack
open dist/<name>-<version>.fbkset  # installs it
```

That is the whole loop. There is no dev server, because an extension *is* a
file and installing one is how everybody else will get it too. `npm run
check` reports every problem in one pass — the manifest, the design tokens
your theme has to define, your components and their examples — and it catches
the mistakes that otherwise show up as a broken slide on somebody else's
machine. `npm run typecheck` adds the ordinary TypeScript pass.

Two rough edges while iterating: reinstalling a design that the open
presentation is *currently using* does not refresh the preview until you
switch designs away and back, and there is no watch mode — repack by hand.

## Adding a slide type

The most common change. It touches two files that have to agree, and
`npm run check` fails if they don't.

**`components.ts`** — the props, as ordinary TypeScript. The doc comments are
not decoration: they are turned into a JSON Schema, and that schema is the
only description the app's AI assistant ever sees of your fields. Say what a
field *means* on the slide, and when not to use it.

```ts
export interface RaciProps {
  /** One row per activity. Three to seven reads well; more needs two slides. */
  rows: {
    /** The activity, as a verb phrase — "Approve the budget". */
    activity: string;
    /** Exactly one name. Two accountables is the bug this slide exists to find. */
    accountable: string;
    responsible: string[];
  }[];
}
```

**`pack.json`** — declare the slide type, prefixed with your id:

```json
{ "kind": "acme.deepseam/raci",
  "description": "Who is accountable for each activity. One name per row.",
  "schemaType": "RaciProps",
  "glyph": "glyphs/raci.svg",
  "example": { "rows": [] } }
```

Four rules worth knowing up front:

- **`example` has to be valid** against its own schema, checked at build time.
  It earns its keep three times over: it's the preview in the app's extension
  list, it's what the AI assistant learns your slide type from, and it proves
  the schema is right.
- **Anything that must survive PowerPoint export needs a `data-pptx`
  attribute.** A component that forgets it exports a silently blank region
  into somebody's deck.
- **Anything that animates or responds to clicks must be marked `webOnly`.**
  It is then only offered for presentations that stay in the browser.
- **Icons are drawn in placeholder colours** — `#ACCENT`, `#INK`, `#MUTED`,
  `#SURFACE`, `#BG` — which the app swaps for its own. You own the shape, the
  app owns the palette, so your icon never clashes with the editor.

## Versions

A presentation records which version of your extension it used, and **only
the major version matters**.

- Patch and minor releases (`1.0.0` → `1.2.0`) **replace** what is installed.
  Fixes and new slide types reach every existing presentation.
- A release that changes how existing slides *look* must bump the **major**.
  `2.0.0` installs alongside `1.x`, so a deck somebody has already presented
  keeps rendering the way they last saw it.

Fix freely within a major version; never restyle within one.

## Publishing

Free extensions go on **npm**, which is where the app's Browse tab looks:

```sh
npm run publish:npm
npm publish dist/npm/package --access public
```

The first command builds your extension and wraps it in a small npm package.
Nothing in that package is ever imported as a Node module — it is a delivery
vehicle, and the app never runs npm at all. It reads the registry over HTTPS,
checks the download against npm's own integrity digest, unpacks your
extension and installs it exactly as a double-click would. No install script
of yours ever runs on a user's machine, which is deliberate on both sides.

The command stops before publishing on purpose. Putting a package on npm is
public and effectively permanent — you can unpublish within 72 hours and
never after — so the last line stays something a person types.

**The npm name and your extension's id have to match.** Publishing refuses a
mismatch: npm is what makes the id unique, and it is written into every
presentation forever, so this is the last moment a collision can be caught.

### Signing

Signing proves the file came from you. It is a **label, not a gate** — an
unsigned extension installs and runs identically — but the label reads
*"unverified source"* on every install dialog, permanently. Sign anything you
hand to somebody else:

```sh
npm run pack -- --key my-key.pem --key-id mine
```

Today only a key the app already knows produces a *verified* badge, so a key
of your own is currently indistinguishable from unsigned. That is a gap on our
side, not a misconfiguration on yours.

### Paid extensions

Sell the file as a digital download on your own [Polar](https://polar.sh)
page. The app performs **no licence check of any kind** — your buyer
double-clicks the file like anyone else. Polar hosts it, runs the checkout and
is merchant of record, so VAT, invoicing and refunds are handled for you, and
nothing about your customers passes through us.

To stay visible in the app anyway, publish a **listing** — the same wrapper
with your descriptions and previews but no extension file in it:

```sh
npm run publish:npm -- --purchase https://buy.polar.sh/your-product
npm publish dist/npm/package --access public
```

Your card then appears in Browse with every slide type previewable, and its
button reads **Buy on Polar** instead of Install.

## When it will not install

One message covers nearly every case:

```
theme was built for platform 2; this app provides 1
```

Your extension and the app disagree about which generation of the platform
they speak. **The toolkit's major version is what decides this**:
`@folienbaukasten/extension-toolkit@1.x` builds for apps on platform 1, `2.x`
for platform 2. If your number is *higher*, the user needs a newer app; if it
is *lower*, rebuild against a newer toolkit and release again. `fbk-pack abi`
prints what your current toolkit targets.

Changing the toolkit's major version is therefore a decision to target a
different generation of the app — never a routine dependency bump.

## Building what is in this repository

```sh
cd toolkit && npm install     # the builder's own dependencies
cd ../sample-extension
npm install                   # only needed for `npm run typecheck`
npm run check
npm run pack
```

The toolkit carries a copy of everything it needs to know about the app — the
platform version, the file format, the design tokens a theme owes, the type
declarations — generated from the app and checked into
[`toolkit/abi/`](toolkit/abi/README.md). That copy is why building an
extension never needs the app's source. It is generated: never edit it by
hand.

## Licence

MIT.

## Design and Development
Design, architecture and development was done together with Claude Code Opus 5.
