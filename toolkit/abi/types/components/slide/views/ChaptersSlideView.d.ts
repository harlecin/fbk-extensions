import type { SlideViewProps } from '../../../sets/types';
import type { ChaptersSlideSpec } from '../../../deck/layouts';
/**
 * Section divider: the chapters ahead as equal columns banded by a rule above
 * and below, split by vertical hairlines. Rules and dividers are 1px `shape`
 * divs (per-side borders export as full outlines).
 *
 * Carries no findings banner by design — a divider states the structure, it
 * does not argue a point.
 */
export declare function ChaptersSlideView({ slide, meta, slideNumber, chrome, }: SlideViewProps<ChaptersSlideSpec>): import("react").JSX.Element;
