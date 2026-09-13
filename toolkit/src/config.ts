/*
 * What an extension declares about itself, and where the toolkit finds it.
 *
 * `pack.json` is the extension's identity — the fields the app's generated
 * catalog carries for a built-in theme. An extension has no catalog entry,
 * so it says the same things here, and the swatch is read from `theme.css`
 * rather than restated: a palette written down twice is a palette that
 * drifts, and the chooser must show the colours the deck will actually use.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** One component the extension ships, as its author declares it. */
export interface PackComponentConfig {
  /** Namespaced by the pack id: `acme/pricing-sheet`. */
  kind: string;
  description?: string;
  /** Needs Web Mode: interactive, animated or canvas-drawn. */
  webOnly?: boolean;
  /** An interface exported by `components.ts`; its JSON Schema is generated
   * from the TypeScript, so the model writes props against real types. */
  schemaType?: string;
  /** Worked props, checked here against that schema. */
  example?: unknown;
  /** Set-relative path of a stylized SVG for the components view. */
  glyph?: string;
}

export interface PackConfig {
  id?: string;
  name?: string;
  description?: string;
  /** Offer it in the theme chooser. */
  production?: boolean;
  version?: string;
  publisher?: string;
  layoutDescriptions?: Record<string, string>;
  /** The theme breaks the HTML ↔ PPTX rules on purpose — Web Mode decks only. */
  pptxSafe?: boolean;
  /** Default `['theme']`, plus `'components'` once any are declared. */
  provides?: ('theme' | 'components')[];
  components?: PackComponentConfig[];
}

export interface ExtensionSource {
  /** Absolute path of the extension directory. */
  dir: string;
  config: PackConfig;
  /** Published id — `pack.json`'s, or the directory name. */
  id: string;
  version: string;
  provides: ('theme' | 'components')[];
  providesTheme: boolean;
  themeCss: string | null;
}

export function readExtension(target: string, overrides: Partial<PackConfig> = {}): ExtensionSource {
  const dir = path.resolve(target);
  if (!existsSync(path.join(dir, 'index.ts'))) {
    throw new Error(
      `no extension at ${dir}: an extension is a directory with an index.ts that ` +
        'default-exports a ComponentSet.',
    );
  }
  const configFile = path.join(dir, 'pack.json');
  const config: PackConfig = existsSync(configFile)
    ? (JSON.parse(readFileSync(configFile, 'utf8')) as PackConfig)
    : {};
  const merged = { ...config, ...overrides };
  const id = merged.id ?? path.basename(dir);
  const provides =
    merged.provides ?? ((merged.components?.length ? ['theme', 'components'] : ['theme']) as
      ('theme' | 'components')[]);
  const cssFile = path.join(dir, 'theme.css');
  return {
    dir,
    config: merged,
    id,
    version: merged.version ?? '1.0.0',
    provides,
    providesTheme: provides.includes('theme'),
    themeCss: existsSync(cssFile) ? readFileSync(cssFile, 'utf8') : null,
  };
}
