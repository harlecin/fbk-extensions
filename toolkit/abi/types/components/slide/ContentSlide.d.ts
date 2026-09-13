import type { ReactNode } from 'react';
import type { DeckMeta, FindingSpec, HeaderSpec } from '../../deck/schema';
import type { SetChrome } from '../../sets/types';
/**
 * The chrome every content slide shares: the active set's header, the body,
 * then the optional findings banner and source line, then the set's footer.
 * Layouts supply only the body, which is why the views are short.
 *
 * It exists as much for geometry as for reuse: the body goes into the
 * `slide-body` region, whose height is the space left over between the
 * reserved chrome bands (src/base.css). A body that hugs its content and one
 * that stretches both live inside that region, so neither can displace the
 * footer — the layouts cannot get this wrong, because they no longer place
 * the chrome themselves.
 *
 * `chrome` arrives explicitly from the active set via `SlideViewProps` — not
 * a React context — so defaults live at platform level and a set never
 * imports another set.
 */
export declare function ContentSlide({ chrome, header, finding, source, meta, slideNumber, children, }: {
    chrome: SetChrome;
    /** Optional: the quote layout deliberately runs without an action title. */
    header?: HeaderSpec;
    finding?: FindingSpec;
    source?: string;
    meta: DeckMeta;
    slideNumber: number;
    children: ReactNode;
}): import("react").JSX.Element;
