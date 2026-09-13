import type { ReactNode } from 'react';
/**
 * The action title, with one phrase optionally in the theme's highlight
 * colour (`HeaderSpec.highlight`).
 *
 * Shared by every set's Header so the behaviour cannot drift between them,
 * and so a set that never thought about highlighting still renders it.
 *
 * Export note: the highlighted phrase is a `<span>` inside the tagged text
 * element, not a separate `data-pptx` node. measure-dom's `runsOf` walks one
 * level of inline markup and emits a styled run per child, so the PPTX gets
 * a single textbox with a coloured run — which is what a highlighted phrase
 * has to be to keep wrapping with the sentence around it.
 *
 * A `highlight` that is not in the title is ignored rather than throwing:
 * the model composes these, and a near-miss should cost the colour, not the
 * slide.
 */
export declare function headerTitle(title: string, highlight?: string): ReactNode;
