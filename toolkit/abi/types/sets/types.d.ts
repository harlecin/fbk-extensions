import type { ComponentType } from 'react';
import type { SharedSlide } from '../deck/layouts';
import type { DeckMeta, HeaderSpec, SlideSpec } from '../deck/schema';
/**
 * A component set is a swappable *styling* layer: chrome, tokens, and
 * optional per-layout view overrides. The layout vocabulary is the
 * platform's (src/deck/layouts.ts) — sets own no layouts, so any deck
 * renders under any set by construction. The PPTX/PDF export works for
 * every set unchanged, because sets render into the platform's measured
 * `data-pptx` primitives — that tagging contract is the platform ABI
 * (see src/export/types.ts).
 */
/** Every layout in the shared vocabulary. */
export type LayoutName = SharedSlide['layout'];
/** The chrome a set must supply: header and footer of every content slide.
 * The frame, the bands and the overflow contract are platform-owned and not
 * reachable from a set.
 *
 * The header receives `meta` as well as its own spec: deck-level marks —
 * `meta.logoUrl` — belong to the document, not to a slide, and a header that
 * had to be told the logo on every slide would be a layout prop pretending
 * to be branding. A set with no place for one simply ignores it. */
export interface SetChrome {
    Header: ComponentType<{
        spec: HeaderSpec;
        meta: DeckMeta;
    }>;
    Footer: ComponentType<{
        meta: DeckMeta;
        slideNumber: number;
    }>;
}
/** Props every slide-layout component receives. */
export interface SlideViewProps<S extends SlideSpec = SlideSpec> {
    slide: S;
    meta: DeckMeta;
    /** 1-based slide number, for footers. */
    slideNumber: number;
    /** The active set's chrome, passed through to `ContentSlide`. */
    chrome: SetChrome;
    /** Extension components reachable from this deck (`ResolvedSet.components`).
     * Only the `component` layout reads it; optional so a view is renderable
     * without it. */
    components?: SetComponents;
}
/** A component that renders one layout. */
export type SlideView = ComponentType<SlideViewProps<any>>;
/**
 * An extension-supplied slide body: hosted by the platform's `component` layout in the
 * bounded body region. It owns a box, never the slide — the chrome bands
 * and the overflow contract are not reachable from it. A component that
 * renders measurable `data-pptx` primitives works in both modes; one that
 * is interactive, animated or canvas-drawn declares `webOnly` and only
 * validates in a Web Mode deck.
 */
export interface SetComponentDef {
    component: ComponentType<{
        props: unknown;
    }>;
    /** Needs the Web Mode validation profile. Default false. */
    webOnly?: boolean;
}
/** Extension components by namespaced kind ("acme/pricing-sheet"). */
export type SetComponents = Record<string, SetComponentDef>;
export interface ComponentSet {
    /** Folder name under src/sets/ — referenced by deck meta.componentSet. */
    id: string;
    /** Human-readable name. */
    name: string;
    /**
     * One line for the theme chooser: what this theme is for, in the register
     * a user picks by ("what a partner presents to a board"), not in tokens.
     */
    description?: string;
    /**
     * A theme we offer to users. Sets without it are regression fixtures —
     * they still render every deck, they are just not something anyone should
     * be *choosing* (BUGS.md, production vs fixture separation). The catalog
     * generator carries this through so the chooser and the theme panel can
     * filter on it.
     */
    production?: boolean;
    /**
     * Header/footer chrome rendered by the platform's ContentSlide.
     *
     * Optional for exactly one shape of pack: a components-only extension
     * (`provides: ['components']`), which ships slide
     * bodies and no styling layer. Such a set is never a deck's theme — the
     * loader imports it only through `loadExtensionComponents` — so nothing
     * ever asks it for a header. A set that *is* a theme has chrome, and
     * `ThemeSet` is the type that says so.
     */
    chrome?: SetChrome;
    /** Layout views this set renders itself; the rest come from the platform
     * (src/components/slide/registry.ts). May not add layouts. */
    overrides?: Partial<Record<LayoutName, SlideView>>;
    /**
     * Slide components this set ships for the `component` layout, keyed by
     * namespaced kind. A separate registry from `overrides`, because a
     * component is not a slide view — it fills a body region the platform
     * hands it.
     */
    components?: SetComponents;
    /**
     * The theme keeps every HTML ↔ PPTX rule (AGENTS.md) and is safe for
     * PowerPoint-mode decks. Default true. A web-only theme sets false and is
     * offered only to Web Mode decks.
     */
    pptxSafe?: boolean;
}
/**
 * A set that can dress a deck: a `ComponentSet` that actually has chrome.
 * Every compiled-in set is one, and so is every pack that provides a theme.
 * Requiring it at the door of `resolveSet` is what keeps the optionality on
 * `ComponentSet.chrome` confined to the components-only case that needs it.
 */
export type ThemeSet = ComponentSet & {
    chrome: SetChrome;
};
/** A set with its registry resolved: platform defaults + the set's
 * overrides, and the extension components reachable from this deck (the
 * set's own plus every installed components pack). What the renderer and
 * export paths consume. */
export interface ResolvedSet extends ComponentSet {
    chrome: SetChrome;
    registry: Record<string, SlideView>;
    components: SetComponents;
}
