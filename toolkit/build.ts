/*
 * Build the toolkit for publishing.
 *
 *   node build.ts
 *
 * The toolkit runs from source on the machine it was written on — Node strips
 * the types and nobody notices. That is not a thing to ask of everybody who
 * installs it: shipping `.ts` would pin every extension author to a Node new
 * enough to strip types, for a benefit none of them receive. So the published
 * tarball is one bundled ESM file.
 *
 * Two things are deliberately NOT bundled:
 *
 * - **The dependencies** (`packages: 'external'`). esbuild ships a platform
 *   binary and typescript is megabytes; both belong in `dependencies` where
 *   npm can resolve the right build for the machine.
 * - **`abi/`**, which is data, not code. It is copied into the tarball as-is
 *   and found at runtime relative to the bundle — see ABI_DIR in src/abi.ts,
 *   which is why the output has to sit exactly one directory below the
 *   package root.
 */
import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
rmSync(path.join(root, 'dist'), { recursive: true, force: true });

await build({
  entryPoints: [path.join(root, 'bin/fbk-pack.ts')],
  outfile: path.join(root, 'dist/fbk-pack.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  // No `banner` for the shebang: esbuild carries the entry point's own
  // through to the bundle, and adding one puts a second `#!` on line 2 —
  // which is a syntax error, not a comment.
  logLevel: 'info',
});

console.log('toolkit: built dist/fbk-pack.js');
