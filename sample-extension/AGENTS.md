# Working in this repository

This is a **Folienbaukasten extension**: a theme plus two slide components,
packaged as one installable `.fbkset` file.

**Read `README.md` first.** It is written for you: what an extension may and
may not be, the seven rules that actually bite, how a component is declared,
and the checklist to run before shipping. The source files are commented with
the reason behind each non-obvious line — those comments are the
documentation, so keep them accurate when you change the code around them.

Fast facts:

- `index.ts` default-exports the `ComponentSet`. That export is the pack's
  entire surface.
- Component kinds are namespaced by the pack id (`acme/…`), declared in
  **both** `index.ts` (the implementation) and `pack.json` (the metadata the
  app reads). Change one, change the other — `fbk-pack check` fails if they
  disagree.
- Prop types live in `components.ts`; their doc comments become the JSON
  Schema the model writes against. They are instructions, not decoration.
- `react` and `@folienbaukasten/platform` are never bundled — they resolve to
  the app's live instances at load time.
- Anything visible that must survive PowerPoint export needs a `data-pptx`
  attribute. Anything that animates must be declared `webOnly`.

Verify a change, never by eye alone:

```sh
npm run typecheck
npm run check          # ../toolkit/bin/fbk-pack.ts — no app checkout needed
npm run pack
```

Rendering is the one step that needs a checkout of the app beside this repo
(`FBK_APP` if it is elsewhere), because a screenshot and a `.pptx` are the
app's renderer rather than a contract:

```sh
npm run install:dev && npm run shot
node ../../ppt/tools/export.ts --deck templates/pricing-review.json --out out/deck.pptx
```

The last command must print no overflow warnings.
