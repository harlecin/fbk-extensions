import type { BlockSpec } from '../deck/schema';
/**
 * Content block, rendered as the theme's `card` or `callout` box style —
 * `variant` selects which (DESIGN-SPEC.md §5.C). All look lives in
 * theme.css, including which side the accent edge sits on: `callout` is
 * left-edged in every theme because a left edge means "aside", while `card`
 * follows the theme's signature side.
 *
 * `bullets` render as a real list under the body. Each item is its own
 * tagged text node so the exporter measures one textbox per bullet — a
 * single multi-line textbox would lose the marker geometry in PPTX.
 *
 * Fills its grid cell, so sibling blocks always share the same height —
 * enforced by the layout, never by content.
 *
 * `path` is the spec's location inside the slide props (`"left"`,
 * `"items.2.block"`), threaded in by the layout for inline editing — the
 * component is the only place that knows whether `body` was a string or an
 * array, so it is where the exact `data-edit` path must be stamped.
 *
 * The same path goes on the root as `data-item`: `data-edit` says "this
 * node's text *is* that scalar", `data-item` says "this node *is* that whole
 * component-shaped value". Freeform drag hit-tests against those nodes and
 * the bake reads them to know where a component ends, so the attribute
 * belongs on the element whose box is the component's visible extent — here
 * the `.box`, not the inner padding wrapper.
 */
export declare function Block({ spec, path }: {
    spec: BlockSpec;
    path?: string;
}): import("react").JSX.Element;
