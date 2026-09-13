import type { SlideViewProps } from '../../../sets/types';
import type { AgendaSlideSpec } from '../../../deck/layouts';
/**
 * Agenda / table of contents: equal-height rows, each an accent-colored
 * two-digit number and the topic, separated by hairline dividers (1px tagged
 * shapes, as in Footer — per-side borders would export as full outlines).
 */
export declare function AgendaSlideView({ slide, meta, slideNumber, chrome }: SlideViewProps<AgendaSlideSpec>): import("react").JSX.Element;
