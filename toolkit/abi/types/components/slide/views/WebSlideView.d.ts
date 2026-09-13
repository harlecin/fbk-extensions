import type { SlideViewProps } from '../../../sets/types';
import type { WebSlideSpec } from '../../../deck/layouts';
/**
 * A slide body the model wrote as HTML and CSS.
 *
 * Tier A: the markup is sanitized and rendered INLINE, in the slide's own
 * document. That is the whole design — a body that never leaves the document
 * keeps every affordance the platform has for free. The theme's tokens reach
 * it through the ordinary cascade, so a theme swap restyles it; `data-edit`
 * text editing, the picker and the overflow check are the same code paths
 * that serve every other layout, because to them this is just DOM inside
 * `.slide-body`.
 *
 * Two things are the view's own work. The stylesheet is scoped to this one
 * slide, so a rule written for this body cannot restyle the deck around it;
 * and a body that tagged nothing gets a `data-pptx` on its wrapper, so a
 * click still selects *something* the chat can be told about.
 *
 * The `data-web-body` marker is what stops a PPTX export dead
 * (src/export/measure-dom.ts) — Web Mode already refuses the export
 * upstream, and this is the belt to that pair of braces.
 */
export declare function WebSlideView({ slide, meta, slideNumber, chrome }: SlideViewProps<WebSlideSpec>): import("react").JSX.Element;
