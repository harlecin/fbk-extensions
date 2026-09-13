import type { FindingSpec } from '../deck/schema';
/**
 * Findings/recommendation banner: accent label segment on the left, light
 * statement bar filling the rest. Square corners by design (per-corner radii
 * cannot be exported). The text spans are tagged individually so their
 * vertically-centered position is measured — the shapes carry no text of
 * their own.
 *
 * The height is FIXED (--banner-height), not content-driven. A one-line and
 * a two-line finding have to occupy the same band: when the banner grew with
 * its text, the slide's bottom edge shifted between slides and the deck
 * visibly breathed from one to the next. Both segments stretch to that
 * height and center their text, so one line sits mid-band and two lines fill
 * it.
 *
 * Text beyond two lines overflows rather than growing the band — deliberate,
 * and the overflow check reports it. A finding that long belongs in the body.
 */
export declare function FindingsBanner({ spec }: {
    spec: FindingSpec;
}): import("react").JSX.Element;
