import type { DeckMeta } from '../../deck/schema';
/**
 * The placeholder shown where an extension component should be and its
 * extension is not installed.
 *
 * Two callers render it: the `component` layout, whose whole body it fills,
 * and a freeform `component` item whose slot names an extension kind. Both
 * want the same three things, which is why this is a component rather than a
 * copied block:
 *
 * - it carries no `data-pptx` tags but does carry `data-fallback-component`,
 *   which is what makes the measurement pass refuse the export instead of
 *   writing a silently blank PPTX region (src/export/measure-dom.ts)
 * - it names the extension the way a person would, not by id, whenever the
 *   deck's own metadata lets us say the name honestly
 * - in the editor it carries the fix, because the Extensions dialog is one
 *   click away from the slide that needs it
 */
export declare function MissingComponent({ kind, meta, compact, }: {
    /** The namespaced kind the deck asked for. */
    kind: string;
    meta: DeckMeta;
    /** Tighter padding and no button — for a freeform item, which is a box on
     * a slide rather than the whole body. */
    compact?: boolean;
}): import("react").JSX.Element;
