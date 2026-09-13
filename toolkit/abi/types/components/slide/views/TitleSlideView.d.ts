import type { SlideViewProps } from '../../../sets/types';
import type { TitleSlideSpec } from '../../../deck/layouts';
/** The platform's default title view: accent bar, heading, subheading,
 * author · date, and an optional title picture filling the right side
 * (object-fit: cover). No footer. Ignores the spec's `eyebrow` and `chips`
 * — sets with a place for them override this view (editorial does). */
export declare function TitleSlideView({ slide }: SlideViewProps<TitleSlideSpec>): import("react").JSX.Element;
