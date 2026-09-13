# Generated — do not edit

This directory is the extension ABI bundle, emitted from the app by
`node tools/emit-abi.ts --out <here>`. It is what lets an extension be
built and checked without a checkout of the app.

Platform ABI 1, pack format 2.
Which app build it came from is in provenance.json — deliberately not in
abi.json, so the drift check fires on a changed contract and not on a
changed commit.

Refresh it after any change to the platform surface, the pack format,
the runtime shims, or the design tokens the platform reads:

```sh
cd <app repo> && npm run abi:emit
```

Anything an extension needs that is missing here is a gap in the ABI,
not a reason to reach back into the app source.
