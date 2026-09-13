import { headerTitle, type HeaderSpec, type DeckMeta } from '@folienbaukasten/platform';

/**
 * The header band of every content slide. The platform gives it the band;
 * what goes in it is the theme's whole visual signature.
 *
 * Two rules are visible here and both matter:
 *
 *   - every visible node carries `data-pptx`. The exporter does not read
 *     this component — it measures the rendered DOM and turns tagged nodes
 *     into PowerPoint shapes. An untagged <div> renders perfectly on screen
 *     and is simply ABSENT from the .pptx.
 *   - `headerTitle` renders `spec.highlight` in the theme's highlight
 *     colour. Use it rather than searching the string yourself; the export
 *     path understands the spans it produces.
 *
 * `meta` arrives because deck-level marks — `meta.logoUrl` — belong to the
 * document, not to a slide. A theme with no place for one ignores it, as
 * this one does.
 */
export function Header({ spec }: { spec: HeaderSpec; meta: DeckMeta }) {
  return (
    <div className="slide-band-header">
      {spec.kicker && (
        <div
          data-pptx="text"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: 'var(--tracking-kicker)',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-1)',
          }}
        >
          {/* Uppercased in JS, never with text-transform: innerText returns
              the untransformed source, so a CSS transform makes the .pptx
              differ from the screen. */}
          {spec.kicker.toUpperCase()}
        </div>
      )}
      <div
        data-pptx="text"
        // Makes the title editable in place in the app's preview. Optional,
        // but a header without it is a header the user cannot click into.
        data-edit="header.title"
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--weight-bold)',
          // No line-height here on purpose: the theme's --line-height (1.4)
          // is at or above Poppins' natural line box. Tighten it and the
          // glyphs overflow their block — the export overflow check then
          // reports the header as a few pixels too tall on every slide with
          // a kicker, which is exactly the kind of warning nobody traces
          // back to a line-height.
        }}
      >
        {headerTitle(spec.title, spec.highlight)}
      </div>
      {spec.subtitle && (
        <div
          data-pptx="text"
          data-edit="header.subtitle"
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
          }}
        >
          {spec.subtitle}
        </div>
      )}
    </div>
  );
}
