import type { CardSpec } from '../deck/schema';
/**
 * One card of a card grid, rendered as the theme's `card` box style.
 *
 * All look lives in theme.css (.box / .box-edge / .box-inner and the
 * .box-card* modifiers, DESIGN-SPEC.md §5.C). This component owns only
 * structure and the export/edit tagging, so a theme restyles every card —
 * including flipping the accent edge from top to left — without touching
 * this file.
 *
 * Emphasis moves the edge color AND the fill together (§5.B2). The edge is
 * always present: on a plain card it is muted, on an emphasis card it is the
 * accent, so a row of cards says which one matters before it is read. That
 * is why the edge is not conditional the way it used to be.
 *
 * The edge and the title separator are real elements rather than CSS
 * borders, because measure-dom reads computed border and a per-side border
 * would export as a full outline.
 *
 * Fills its grid cell, so sibling cards always share a height.
 */
export declare function Card({ spec, path }: {
    spec: CardSpec;
    path?: string;
}): import("react").JSX.Element;
