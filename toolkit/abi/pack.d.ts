/**
 * `.fbkset` theme packs — the installable form of a component set (ui.md A9).
 *
 * A pack is a zip, the same move `.fbk` makes for decks (project/bundle.ts):
 * one file that can be mailed, double-clicked, or downloaded. Installing it
 * extracts it under `userData/sets/<id>/<major>/`; from there it is served at
 * `/sets/<id>/…` and `src/sets/loader.ts` loads it beside the compiled-in
 * sets, returning the same `ComponentSet` the renderer already consumes.
 *
 *   manifest.json    what this file describes — id, version, ABI, publisher
 *   set.js           prebuilt ESM, default-exporting a ComponentSet
 *   set.css          the theme's tokens (the `import './theme.css'` output)
 *   guide.md         optional LLM guidance, appended to GUIDE.md when active
 *   templates/*.json optional starter decks, offered in the New Deck dialog
 *   preview.png      optional picture for the chooser
 *   signature.json   optional Ed25519 signature over the other files
 *
 * This module is types and pure functions only: main validates packs with
 * it at install time, the renderer reads the installed index with it, and
 * tools/pack-set.ts writes manifests with it. Nothing here touches fs or
 * electron.
 */
/** Bumped when the pack layout itself changes shape. v2 added `provides`,
 * per-component metadata and web-only declarations; v1 packs still install — they are
 * simply themes that provide no components. */
export declare const PACK_FORMAT_VERSION = 2;
/** Formats this app still reads. */
export declare const SUPPORTED_PACK_FORMATS: readonly number[];
/**
 * The platform ABI a pack is built against: the `ComponentSet` interface
 * plus the `data-pptx` tagging contract the exporter measures
 * (src/export/types.ts). A set that renders untagged markup produces a
 * broken PPTX, which is why this is versioned separately from the app and
 * checked at install time rather than discovered at export time.
 *
 * Major changes break packs; minor additions do not. A pack declares the
 * major it was built for and is accepted while that major still matches.
 */
export declare const PLATFORM_ABI = 1;
export declare const PACK_EXT = ".fbkset";
/** Files every pack must contain. A pack that provides a theme additionally
 * needs `set.css` — see `requiredPackFiles`. */
export declare const REQUIRED_PACK_FILES: readonly ['manifest.json', 'set.js'];
/** What an extension provides. Absent in a manifest = `['theme']`, which is
 * every v1 pack. */
export type PackProvides = 'theme' | 'components';
/** One extension-supplied slide component, as the manifest declares it. */
export interface PackComponentMeta {
    /** Namespaced kind: `<pack id>/<component-name>`. */
    kind: string;
    /** One line for the sidebar and the LLM prompt. */
    description?: string;
    /** JSON Schema for the component's props, generated from the author's
     * TypeScript by tools/pack-set.ts. Absent = unvalidated. */
    schema?: unknown;
    /**
     * Worked example props, valid against `schema` — the pack ships the *data*,
     * never a picture. The app
     * renders it through its own thumbnail path to show the component in the
     * editor, and hands it to the model as a usage example. Absent costs the
     * component its preview and nothing else.
     */
    example?: unknown;
    /**
     * Pack-relative path to a stylized SVG for the components view — the
     * author's own diagram of what this component draws, in the app's palette. Preferred over the
     * rendered example: it is legible at card size, costs no render, and is the
     * only thing a catalogue can show for an extension that is not installed.
     *
     * It is displayed as an *image*, never inlined into the editor's DOM —
     * scripts do not run and external references do not load in that context,
     * which is what makes author-supplied markup safe here at all.
     */
    glyph?: string;
    /** The component is interactive, animated or otherwise unmeasurable: it
     * only validates in a Web Mode deck. */
    webOnly?: boolean;
}
export interface SetPackManifest {
    formatVersion: number;
    /** Folder name and `meta.componentSet` value. Lowercase, url-safe. */
    id: string;
    name: string;
    description?: string;
    /** Semver. The major decides which install slot the pack occupies. */
    version: string;
    /** Platform ABI major this pack was built against. */
    platformAbi: number;
    /** Who made it — shown in the install dialog beside the trust verdict. */
    publisher?: string;
    /** Offer it in the theme chooser. Absent = installed but not promoted. */
    production?: boolean;
    /** Palette preview for the chooser, same five colours the catalog carries. */
    swatch?: PackSwatch;
    /** Starter decks shipped with the theme, in the order they are offered. */
    templates?: PackTemplate[];
    /** Per-layout advice that replaces the platform description in the prompt. */
    layoutDescriptions?: Record<string, string>;
    /** What the pack ships. Absent = `['theme']` (every v1 pack). A
     * components-only pack carries no `set.css` and no chrome, and is never
     * offered as a theme — its components render under any theme. */
    provides?: PackProvides[];
    /** Slide components the pack ships, when `provides` includes 'components'. */
    components?: PackComponentMeta[];
    /**
     * The theme keeps every "Rules that keep HTML ↔ PPTX identical" rule and is
     * safe for PowerPoint-mode decks. Absent = true. A web-only theme
     * (`pptxSafe: false`) uses CSS the exporter cannot measure and is offered
     * only to Web Mode decks.
     */
    pptxSafe?: boolean;
}
/** Whether a manifest provides the given capability. */
export declare function packProvides(manifest: SetPackManifest, what: PackProvides): boolean;
/** The files this particular pack must contain. */
export declare function requiredPackFiles(manifest: SetPackManifest): string[];
export interface PackSwatch {
    bg: string;
    surface: string;
    ink: string;
    accent: string;
    highlight: string;
}
export interface PackTemplate {
    /** File under templates/, without the .json. */
    id: string;
    name: string;
    description?: string;
}
/** Ed25519 over the sorted `sha256(file)` digests of every other pack file. */
export interface PackSignature {
    algorithm: 'ed25519';
    /** Key id, so a rotated key can still verify what the old one signed. */
    keyId: string;
    /** Base64 signature over `signingPayload()`. */
    signature: string;
}
/**
 * What a signature covers: every file in the pack except the signature
 * itself, as `path\tsha256hex` lines, sorted. Signing the digests rather
 * than the zip means a pack stays verifiable after extraction — which is
 * what lets the app re-check an *installed* set, not just an incoming file.
 */
export declare function signingPayload(digests: Record<string, string>): string;
/**
 * Whether a pack's code is known to come from a publisher we trust.
 *
 * This is a *label*, never a gate: an unsigned pack installs and runs with
 * exactly the same capability as a signed one. The distinction the user is
 * shown is honest about what it means — a theme is code running in the
 * renderer, and a signature says who wrote it, not that it is harmless.
 */
export type PackTrust = 'verified' | 'untrusted';
/** An installed pack, as the app and the renderer see it. */
export interface InstalledSet {
    id: string;
    name: string;
    description?: string;
    version: string;
    publisher?: string;
    production?: boolean;
    swatch?: PackSwatch;
    templates?: PackTemplate[];
    layoutDescriptions?: Record<string, string>;
    provides?: PackProvides[];
    components?: PackComponentMeta[];
    pptxSafe?: boolean;
    trust: PackTrust;
    /** Root-relative base every pack file is served under: `/sets/<id>`. */
    base: string;
    /** ISO timestamp of the install, for the manage list. */
    installedAt: string;
    /** Pack ships a guide.md the system prompt should pick up. */
    hasGuide?: boolean;
}
/** Served at `/sets/index.json`; the loader's whole view of what is installed. */
export interface SetsIndex {
    sets: InstalledSet[];
}
/** Ids the platform owns; a pack may not shadow one of the compiled-in sets. */
export declare function reservedIds(builtIn: readonly string[]): Set<string>;
export declare function majorOf(version: string): number;
/** Compare two semvers; >0 when `a` is newer. Pre-release tags are ignored. */
export declare function compareVersions(a: string, b: string): number;
/**
 * Everything wrong with a manifest, in one pass — an install dialog that
 * reports one problem per attempt is how a theme author gives up.
 * Empty array = installable.
 */
export declare function manifestProblems(value: unknown, builtIn?: readonly string[]): string[];
/** The `InstalledSet` view of a manifest, once it is on disk. */
export declare function installedSetOf(manifest: SetPackManifest, extra: {
    trust: PackTrust;
    installedAt: string;
    hasGuide: boolean;
}): InstalledSet;
