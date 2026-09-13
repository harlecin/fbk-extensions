# __NAME__ — a worked Folienbaukasten extension

This repository is a **complete, building, rendering example** of an
extension for the Folienbaukasten slide app: a theme (`__NAME__`), one
PowerPoint-safe slide component (`__ID__/pricing-sheet`), one web-only slide
component (`__ID__/flow`), an LLM guide, and two starter decks.

Copy it, rename it, replace the contents. Every file here is one of the
files your extension needs, and every non-obvious line is commented with the
reason it is that way.

> This project is a working extension from the first commit. The rules it
> follows are written out at
> https://github.com/harlecin/fbk-extensions, and
> `@folienbaukasten/extension-toolkit` is what builds it.

---

## What an extension is

One file — `__ID__-1.0.0.fbkset`, a zip — that a user double-clicks to
install. Installed, it can contribute two things and only two:

| It ships | What that means | Portability |
| --- | --- | --- |
| a **theme** | design tokens + the header/footer chrome of every content slide | every deck renders under it; a deck written in it opens elsewhere in the default theme, just in different clothes |
| **components** | bespoke slide *bodies*, hosted by the platform's `component` layout | a deck using one shows an "install this extension" placeholder without it |

An extension **may not add a layout**. The layout vocabulary
(`title`, `two-block`, `chart`, `component`, …) belongs to the platform, and
that is the property that makes every deck render under every theme, so a
theme can be sold without knowing which decks it will meet. A component owns
a *box* — the body region it is handed. It cannot place chrome, cannot touch
the header/footer bands, and cannot push the footer off the canvas.

Either half is optional:

- `"provides": ["theme"]` — a styling layer, no components.
- `"provides": ["components"]` — no `set.css`, no chrome, never appears in
  the theme picker; its components render under *every* theme. This is the
  portable shape: the component is the dependency, the styling is not.
- `"provides": ["theme", "components"]` — what this repo does.

## The files

```
pack.json          identity + the component declarations (schema, glyph, example)
index.ts           default-exports the ComponentSet — the pack's whole surface
theme.css          every design token the platform reads, plus the box styles
components.ts      the prop TYPES; the packer generates JSON Schema from them
components/        Header, Footer, and one file per slide component
glyphs/            one small SVG per component, for the components view
guide.md           appended to the LLM's system prompt while the theme is active
templates/*.json   starter decks, offered in the New Deck dialog
tsconfig.json      extends the toolkit's — that is where the platform types come from
package.json       check / pack / typecheck, and the app-dependent render loop
```

## Build it

Packing and checking need **only this repository** — the toolkit beside you
carries the platform contract it builds against (see
[`../toolkit/README.md`](../toolkit/README.md)).

```sh
npm run typecheck            # tsc against the platform's declarations
npm run check                # every compatibility check, in one pass
npm run pack                 # → dist/__ID__-1.0.0.fbkset (checks run first)
```

Or, spelled out:

```sh
node ../toolkit/bin/fbk-pack.ts check .
node ../toolkit/bin/fbk-pack.ts pack . --out dist --publisher "__PUBLISHER__"
node ../toolkit/bin/fbk-pack.ts abi     # which platform this toolkit targets
```

**Rendering** is the one thing that needs the app itself — a screenshot or a
`.pptx` is the app's renderer, not a contract. With a checkout beside this
repo (`FBK_APP` if it lives elsewhere):

```sh
npm run install:dev          # install the pack into ./.dev-sets
npm run shot                 # render templates/pricing-review.json → ./out
node ../../ppt/tools/export.ts --deck templates/pricing-review.json --out out/deck.pptx
```

What the harness renders is the **extracted pack** — its stylesheet, its
prebuilt ESM, the runtime shims — not your source tree, so it fails the way
an installed copy would. `PPT_SETS_ROOT` is deliberately required: writing
into the real app's set root as a side effect of a test render is not
something to do by accident.

To try it in the app itself, install `dist/*.fbkset` through
**Extensions → Install…**, or double-click the file.

## The rules that actually bite

**1. Tag everything you draw.** The exporter does not read your components —
it measures the rendered DOM and turns tagged nodes into PowerPoint shapes.
A `<div>` with no `data-pptx` renders beautifully on screen and is *absent*
from the `.pptx`. Every visible node needs `data-pptx="text"`, `"shape"`,
`"image"` or `"chart"`. Corollaries:

- one `backgroundColor` per shape: no gradients, no box-shadows. A two-tone
  rule is two adjacent `shape` divs.
- no `text-transform` — `innerText` returns the untransformed source, so the
  `.pptx` would differ from the screen. Uppercase in JS.
- no per-side borders on things that must export; draw a 1px filled div.
- a `::before` bullet draws nothing the measurement pass can see. Put the
  character in the text.
- fonts must exist in the measuring browser *and* on the machine that opens
  the deck, or line wraps shift.
- don't set a `line-height` below the font's natural line box: the glyphs
  overflow their block, and the export overflow check reports the band as a
  few pixels too tall on every slide.

**2. Never draw a chart.** A chart is a `ChartSpec` rendered by the
platform's `ChartView` — ECharts in the browser, a native `<c:chart>` in the
`.pptx`, editable by the recipient. Building one out of `data-pptx="shape"`
rectangles produces a picture nobody can edit.

**3. Define every platform token.** `theme.css` must define every custom
property the platform's components read without a fallback, plus all ten
named box-style classes (`.box-card`, `.box-stat`, …). `fbk-pack check`
reports exactly which are missing, from the contract the toolkit carries. The
cheap way to get it right is what was done here: copy a working `theme.css`
and change values.

**4. A pack never bundles React.** `react` and `@folienbaukasten/platform`
resolve at load time to the app's live instances — two copies of React in one
page is two renderers. Import anything else you like; it gets bundled into
`set.js` and becomes your pack's size.

**5. `height: '100%'`, not `flex: 1`, at a component's root.** The host hands
your component a plain block that already has the body's height. `flex: 1`
on a root whose parent is not a flex container silently does nothing, and the
component renders as a short strip at the top of the body.

**6. A web-only component must never claim to be PPTX-safe.** If it
animates, is interactive, or is canvas-drawn, declare `"webOnly": true` in
`pack.json`. It is then invisible to the model and rejected by validation
until the deck activates Web Mode. Declared safe, it would export as a
silently blank region.

**7. Entrance animations render at rest.** Scope them to
`section.present`, animate with `both` from a hidden keyframe (so the
*resting* state is the real one), and switch them off under
`html[data-still]` and `prefers-reduced-motion`. Every capture path — export,
thumbnails, the screenshot harness — sets `data-still` and expects the
finished frame. `components/Flow.tsx` is the worked example.

## Declaring a component

Three things go together, and the app reads all three from `pack.json`:

```json
{ "kind": "__ID__/pricing-sheet",
  "description": "…one line, shown in the sidebar and given to the model",
  "schemaType": "PricingSheetProps",
  "glyph": "glyphs/pricing-sheet.svg",
  "example": { "tiers": [ … ] } }
```

- **`kind` is namespaced by the pack id.** `__ID__/pricing-sheet`. The packer
  refuses anything else, so two publishers can never collide and a kind says
  where to get it.
- **`schemaType`** names an exported interface in `components.ts`. The packer
  generates its JSON Schema from your TypeScript — so the model writes props
  against your types and ajv validates them. **The doc comments in
  `components.ts` are the only instructions the model gets about each
  field.** Write them for someone who has never seen the component: what the
  field means on the slide, and how many of a thing is too many.
- **`glyph`** is a small SVG (≤16 KB, 16:9) drawn in placeholder colours —
  `#ACCENT`, `#MUTED`, `#SURFACE`, `#BG`, `#INK` — which the app swaps for
  its own palette. It is what the components view shows on the card, and the
  only thing a catalogue can show before anyone installs you.
- **`example`** is worked props, checked at pack time against the generated
  schema — a pack whose own example fails its own schema does not build. The
  editor renders it as the component's preview, and the model is shown it as
  one worked use.

And the implementation is registered in `index.ts`:

```ts
components: { '__ID__/pricing-sheet': { component: PricingSheet } }
```

## guide.md — teaching the model your extension

Appended to the system prompt while your theme is active. It is where the
extension says what no schema can: "there is no logo slot", "use the accent
once per slide", "`__ID__/flow` needs Web Mode — if the deck is in PowerPoint
mode, reach for `timeline` instead". It is the difference between an
extension the model uses well and one it fights. Trimmed at 8 000 characters.

## Versions

A deck records `meta.componentSetVersion` and **only its major matters**.

- Patch and minor (`1.0.0` → `1.2.0`) **replace** what is installed: fixes and
  new components reach every deck.
- A release that changes how slides *look* must bump the **major**. `2.0.0`
  installs beside `v1`, so a deck someone has already presented keeps
  rendering as it did.

So: fix freely inside a major, and never restyle inside one.

## Signing

Optional, and it is a *label*, not a gate: an unsigned pack installs and runs
with exactly the same capability. What changes is the install dialog's
wording and a badge in the theme list.

```sh
node ../../ppt/tools/set-keys.ts my-key   # writes my-key.pem, prints the public half
npm run pack -- --key my-key.pem --key-id mine
```

## Checklist before you ship

- [ ] `npm run typecheck` passes.
- [ ] `npm run check` is clean — manifest, theme tokens, box styles, every
      component's schema, example, glyph, and `pack.json` agreeing with
      `index.ts`.
- [ ] `npm run pack` succeeds. (It runs the checks again; a pack that would
      not install is never written.)
- [ ] `npm run install:dev && npm run shot` — the slides look right, rendered
      from the extracted pack.
- [ ] `node ../../ppt/tools/export.ts --deck templates/<t>.json --out out/deck.pptx`
      prints **no overflow warnings**, and the `.pptx` carries your colours.
      (A good extra check: run the app's own sample deck through your theme
      with `--set <your id>`.)
- [ ] `guide.md` says the things a schema cannot.
- [ ] The version's major is right for what changed.
