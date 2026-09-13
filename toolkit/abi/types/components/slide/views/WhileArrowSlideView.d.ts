import type { SlideViewProps } from '../../../sets/types';
import type { WhileArrowSlideSpec } from '../../../deck/layouts';
/**
 * "While a … we need to consider b" — two blocks joined by a slim triangular
 * blade spanning ~90% of the block height, pointing left → right.
 *
 * Both sides always render as the SAME block variant. The layout is one
 * sentence split across an arrow, and giving the halves different fills
 * breaks the parallel it exists to draw — the eye reads two unrelated boxes
 * instead of a claim and its consequence. The variant comes from `left`;
 * a differing `right.variant` is ignored rather than honoured, because
 * there is no correct way to render a mismatch here.
 */
export declare function WhileArrowSlideView({ slide, meta, slideNumber, chrome, }: SlideViewProps<WhileArrowSlideSpec>): import("react").JSX.Element;
