import type { SlideViewProps } from '../../../sets/types';
import type { CardsSlideSpec } from '../../../deck/layouts';
/**
 * Card grid. Up to three cards sit in one row; four or more wrap into three
 * columns, so a fourth card starts a second row rather than shrinking the
 * first three past readability.
 *
 * The insight rail is body content, not chrome — it comments on the cards —
 * so it shares the body region with them rather than sitting beside the
 * findings banner.
 */
export declare function CardsSlideView({ slide, meta, slideNumber, chrome }: SlideViewProps<CardsSlideSpec>): import("react").JSX.Element;
