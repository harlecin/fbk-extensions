/*
 * Compatibility checks — everything about an extension that can be known
 * before it is installed.
 *
 * These run on `fbk-pack check` and again inside `fbk-pack pack`, because a
 * pack that fails them is a pack that should never have been written to
 * disk. They fall in three groups:
 *
 *  - **the manifest**, checked with the app's own `manifestProblems` from the
 *    ABI bundle, so what passes here is what installs there;
 *  - **the theme contract** — every custom property the platform reads
 *    without a fallback, and every named box style. Nothing checked this for
 *    an out-of-repo theme before: a missing token silently degraded the
 *    rendering, on the user's machine, with no message anywhere;
 *  - **the components** — kinds namespaced by the pack id, schemas that
 *    exist, examples that satisfy their own schema, glyphs that are small
 *    SVGs, and the declaration in `pack.json` agreeing with what `index.ts`
 *    actually registers.
 *
 * Every problem in one pass. A tool that reports one problem per attempt is
 * how an extension author gives up.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { abi, packFormat, type SetPackManifest } from './abi.ts';
import type { ExtensionSource } from './config.ts';

/** Anything above 16 KB is an illustration, not a diagram on a card. */
export const MAX_GLYPH_BYTES = 16_384;

export interface Findings {
  errors: string[];
  warnings: string[];
}

export function emptyFindings(): Findings {
  return { errors: [], warnings: [] };
}

export function merge(into: Findings, from: Findings): Findings {
  into.errors.push(...from.errors);
  into.warnings.push(...from.warnings);
  return into;
}

/** Custom properties a stylesheet defines. */
function definedTokens(css: string): Set<string> {
  return new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]!));
}

/**
 * `(?![-\w])` rather than `\b`: `\b` matches before a hyphen, so
 * `.box-stat-label` would satisfy a requirement for `.box-stat` and the
 * check would pass vacuously.
 */
function definesBoxStyle(css: string, cls: string): boolean {
  return new RegExp(`\\.${cls}(?![-\\w])[^{]*\\{`).test(css);
}

/**
 * The theme contract: a stylesheet that misses a token the platform reads
 * without a fallback renders something subtly wrong — an unstyled card, a
 * chart series with no colour — on a machine the author never sees.
 */
export function checkTheme(ext: ExtensionSource): Findings {
  const out = emptyFindings();
  if (!ext.providesTheme) {
    if (ext.themeCss) {
      out.errors.push(
        'this pack provides no theme but has a theme.css. The loader links a stylesheet only ' +
          'for a pack that provides a theme, so it would ship and never load. Style from the ' +
          'platform tokens instead — every theme defines them.',
      );
    }
    return out;
  }
  if (!ext.themeCss) {
    out.errors.push('a theme needs a theme.css, imported from index.ts');
    return out;
  }
  const defined = definedTokens(ext.themeCss);
  const missing = abi.requiredTokens.filter((t) => !defined.has(t));
  if (missing.length > 0) {
    out.errors.push(
      `theme.css is missing ${missing.length} platform token(s): ${missing.join(', ')}\n` +
        '  → the platform reads these without a fallback. Copy a working theme.css and ' +
        'change its values rather than assembling one.',
    );
  }
  const missingStyles = abi.requiredBoxStyles.filter((cls) => !definesBoxStyle(ext.themeCss!, cls));
  if (missingStyles.length > 0) {
    out.errors.push(
      `theme.css is missing required box styles: ${missingStyles.map((c) => `.${c}`).join(', ')}\n` +
        '  → base.css owns the box structure; each theme owns the look, and an undefined ' +
        'style renders an unstyled box rather than failing.',
    );
  }
  const missingSwatch = Object.entries(abi.swatchTokens)
    .filter(([, token]) => !new RegExp(`${token}:\\s*[^;]+;`).test(ext.themeCss!))
    .map(([, token]) => token);
  if (missingSwatch.length > 0) {
    out.warnings.push(
      `no swatch could be read (${missingSwatch.join(', ')} not found), so the theme chooser ` +
        'will show it without its palette',
    );
  }
  return out;
}

/** Glyphs: small SVGs, displayed as images, one per component card. */
export function checkGlyph(ext: ExtensionSource, kind: string, rel: string): Findings {
  const out = emptyFindings();
  const file = path.join(ext.dir, rel);
  if (!rel.endsWith('.svg') || !existsSync(file)) {
    out.errors.push(`component '${kind}': glyph '${rel}' is not an .svg file here`);
    return out;
  }
  const bytes = statSync(file).size;
  if (bytes > MAX_GLYPH_BYTES) {
    out.errors.push(
      `component '${kind}': glyph is ${bytes} bytes; the limit is ${MAX_GLYPH_BYTES}. ` +
        'It is a diagram on a card, not an illustration.',
    );
  }
  if (!/^\s*(<\?xml|<!--|<svg)/.test(readFileSync(file, 'utf8'))) {
    out.errors.push(`component '${kind}': glyph is not SVG`);
  }
  return out;
}

/**
 * The manifest, by the app's own rules. `manifestProblems` is the function
 * install runs, shipped in the ABI bundle — so "it packs" and "it installs"
 * cannot come apart.
 */
export function checkManifest(manifest: SetPackManifest): Findings {
  const out = emptyFindings();
  for (const problem of packFormat.manifestProblems(manifest, abi.builtInSetIds)) {
    out.errors.push(problem);
  }
  if (manifest.platformAbi !== abi.platformAbi) {
    out.errors.push(
      `this pack declares platform ABI ${manifest.platformAbi}, the bundle provides ` +
        `${abi.platformAbi}`,
    );
  }
  return out;
}

/**
 * What `index.ts` actually exports, obtained by importing the built bundle
 * with a stand-in for the set runtime.
 *
 * It is the only way to answer the question that matters most and that no
 * amount of reading pack.json can: does the code register the components it
 * claims? A kind declared in the manifest and missing from the set installs
 * fine and blanks a slide body at the moment someone presents it.
 *
 * The stand-in is a Proxy, so the shims' load-time guard is satisfied and
 * every platform value the module destructures comes back defined. Module
 * top-level code is the author's own; if it throws, this degrades to a
 * warning rather than blocking the pack.
 */
export async function inspectSet(bundle: string): Promise<
  { id?: string; components: string[]; webOnly: string[]; hasChrome: boolean } | null
> {
  const anything: unknown = new Proxy(function stub() {} as object, {
    get: (_t, prop) => (prop === 'default' ? anything : anything),
    apply: () => anything,
    construct: () => anything as object,
  });
  (globalThis as Record<string, unknown>).__FBK_SET_RUNTIME__ = {
    react: anything,
    jsxRuntime: anything,
    platform: anything,
  };
  try {
    // A file URL, not a path: a relative path would be read as a bare
    // specifier, and the query defeats the module cache so two packs in one
    // process see their own module.
    const mod = (await import(`${pathToFileURL(path.resolve(bundle)).href}?t=${Date.now()}`)) as {
      default?: {
        id?: string;
        chrome?: unknown;
        components?: Record<string, { webOnly?: boolean }>;
      };
    };
    const set = mod.default;
    if (!set) return null;
    const components = Object.entries(set.components ?? {});
    return {
      id: set.id,
      components: components.map(([kind]) => kind),
      webOnly: components.filter(([, def]) => def?.webOnly).map(([kind]) => kind),
      hasChrome: typeof set.chrome === 'object' && set.chrome !== null,
    };
  } catch {
    return null;
  } finally {
    delete (globalThis as Record<string, unknown>).__FBK_SET_RUNTIME__;
  }
}

/** `pack.json` and `index.ts` must describe the same extension. */
export function checkRegistration(
  ext: ExtensionSource,
  set: Awaited<ReturnType<typeof inspectSet>>,
  declared: { kind: string; webOnly?: boolean }[],
): Findings {
  const out = emptyFindings();
  if (!set) {
    out.warnings.push(
      "index.ts could not be inspected, so pack.json's component list was not checked against " +
        'the set that will actually load',
    );
    return out;
  }
  if (set.id && set.id !== ext.id) {
    out.errors.push(
      `index.ts exports id '${set.id}' but this pack publishes as '${ext.id}'. The id is the ` +
        'namespace of every component kind and the value a deck records — they must match.',
    );
  }
  const declaredKinds = declared.map((c) => c.kind);
  const unregistered = declaredKinds.filter((k) => !set.components.includes(k));
  if (unregistered.length > 0) {
    out.errors.push(
      `pack.json declares component(s) index.ts does not register: ${unregistered.join(', ')}\n` +
        "  → the app would offer the slide type and then blank the slide's body.",
    );
  }
  const undeclared = set.components.filter((k) => !declaredKinds.includes(k));
  if (undeclared.length > 0) {
    out.errors.push(
      `index.ts registers component(s) pack.json does not declare: ${undeclared.join(', ')}\n` +
        '  → undeclared components have no description, schema or glyph, so the model never ' +
        'writes them and the components view cannot show them.',
    );
  }
  for (const c of declared) {
    const codeSaysWebOnly = set.webOnly.includes(c.kind);
    if (Boolean(c.webOnly) !== codeSaysWebOnly) {
      out.errors.push(
        `component '${c.kind}': webOnly is ${String(Boolean(c.webOnly))} in pack.json but ` +
          `${String(codeSaysWebOnly)} in index.ts.\n` +
          '  → the app reads pack.json. A web-only component declared PPTX-safe exports as a ' +
          'silently blank region.',
      );
    }
  }
  if (ext.providesTheme && !set.hasChrome) {
    out.errors.push(
      'this pack provides a theme but index.ts exports no chrome — a theme owns the header ' +
        'and footer of every content slide',
    );
  }
  return out;
}

/** Warnings that are about intent rather than correctness. */
export function checkIntent(ext: ExtensionSource): Findings {
  const out = emptyFindings();
  if (ext.providesTheme && !ext.config.production) {
    out.warnings.push(
      `'${ext.id}' is not marked production: true — the installed theme appears in the ` +
        'Installed list but not in the theme chooser, so nobody can pick it',
    );
  }
  if (!ext.config.publisher) {
    out.warnings.push('no publisher — the install dialog will have no name to show');
  }
  return out;
}
