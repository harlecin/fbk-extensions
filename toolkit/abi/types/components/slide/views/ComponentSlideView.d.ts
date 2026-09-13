import type { SlideViewProps } from '../../../sets/types';
import type { ComponentSlideSpec } from '../../../deck/layouts';
/**
 * Host for an extension-supplied slide body: a
 * `ContentSlide` whose single full-body slot is filled by the component the
 * deck names. The component owns a box, never the slide — chrome, bands and
 * the overflow contract stay platform-owned by construction.
 *
 * An unknown kind blanks only the body: correct chrome, correct slide
 * number, the rest of the deck untouched, and a placeholder saying which
 * extension is missing. The placeholder carries no `data-pptx` tags but a
 * `data-fallback-component` marker, so the measurement pass refuses to
 * export the deck rather than writing a silently blank PPTX region
 * (src/export/measure-dom.ts — the FallbackSlide mechanism, one level down).
 *
 * In the editor the placeholder also carries the fix (see MissingComponent,
 * which a freeform `component` item renders too).
 */
export declare function ComponentSlideView({ slide, meta, slideNumber, chrome, components, }: SlideViewProps<ComponentSlideSpec>): import("react").JSX.Element;
