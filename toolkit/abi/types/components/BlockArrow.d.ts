/**
 * Slim right-pointing blade between the "while …" boxes: a solid isosceles
 * triangle — width tapers from nothing at top/bottom to the apex at
 * mid-height. Fills its container.
 *
 * PPTX: exported as the native `triangle` preset rotated 90° (see
 * tools/export.ts), which is geometrically identical, so HTML and PPTX
 * match by construction — the exporter reads the *computed* fill, so a set
 * that retints the blade needs no export change.
 *
 * Colour: `--color-arrow`, falling back to the accent. It is connective
 * tissue — it says "and then", it is not the point of the slide — so a set
 * whose accent is loud can quiet it down without a component override. The
 * fallback keeps the token optional for sets that do not care.
 */
export declare function BlockArrow(): import("react").JSX.Element;
