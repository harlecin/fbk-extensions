/*
 * The ABI bundle: the app's contract, as data checked in beside the
 * extensions (see abi/README.md).
 *
 * Packaging must not need a checkout of the app. Everything the packer and
 * the checks below want to know about the platform — which tokens a theme
 * owes, what the pack format accepts, what the runtime shims expose — is
 * emitted from the app by `node tools/emit-abi.ts` and read from here.
 *
 * `pack.js` is the exception worth pointing at: it is the app's own
 * `src/sets/pack.ts`, compiled. The manifest rules the toolkit enforces are
 * therefore the *same code* the app runs at install time, not a second
 * implementation of them that can disagree.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { SetPackManifest } from '../abi/pack.d.ts';

export const ABI_DIR = path.resolve(import.meta.dirname, '../abi');

export interface AbiContract {
  platformAbi: number;
  packFormatVersion: number;
  supportedPackFormats: number[];
  platformExports: string[];
  requiredTokens: string[];
  optionalTokens: string[];
  requiredBoxStyles: string[];
  swatchTokens: Record<string, string>;
  layouts: string[];
  builtInSetIds: string[];
}

export const abi: AbiContract = JSON.parse(
  readFileSync(path.join(ABI_DIR, 'abi.json'), 'utf8'),
) as AbiContract;

/**
 * Which app build the bundle came from. Deliberately NOT part of the
 * contract: a bundle that differed by commit would fail the app's drift
 * check on every commit, whether or not anything an extension depends on had
 * moved. It is provenance for a person reading `fbk-pack abi`, and nothing
 * reads it to decide anything.
 */
export const provenance: { app: string; commit: string; emittedAt: string } = existsSync(
  path.join(ABI_DIR, 'provenance.json'),
)
  ? (JSON.parse(readFileSync(path.join(ABI_DIR, 'provenance.json'), 'utf8')) as {
      app: string;
      commit: string;
      emittedAt: string;
    })
  : { app: 'unknown', commit: 'unknown', emittedAt: 'unknown' };

/**
 * The app's own pack-format module, compiled into the bundle.
 *
 * Imported by file URL rather than by path: a bare absolute path works on
 * macOS and Linux and throws `ERR_UNSUPPORTED_ESM_URL_SCHEME` on Windows,
 * where `C:\…` reads as a URL scheme. Harmless while this only ran here;
 * a published package has no such excuse.
 */
export const packFormat = (await import(
  pathToFileURL(path.join(ABI_DIR, 'pack.js')).href
)) as typeof import('../abi/pack.d.ts');

export type { SetPackManifest };

/** Where the react / jsx-runtime / platform shims live. A pack never bundles
 * React: two copies in one page are two renderers. */
export const SHIMS = path.join(ABI_DIR, 'shims');
