import type { PricingSheetProps, PricingTier } from '../components.ts';

/**
 * `__ID__/pricing-sheet` — a PPTX-safe extension component.
 *
 * What a component is handed is a BOX: the body region of a `component`
 * slide, already inside the platform's frame. It cannot place chrome, cannot
 * reach the header/footer bands, and cannot push the footer off the canvas —
 * which is exactly why extensions ship components and never layouts.
 *
 * PPTX-safe means every visible node is tagged and every style survives
 * measurement:
 *
 *   - `data-pptx="shape"` for fills, `"text"` for type. Untagged nodes are
 *     invisible to the exporter — they simply do not appear in the .pptx.
 *   - a tagged shape gets ONE background colour. No gradients, no shadows.
 *     Two-tone means two adjacent divs (the accent cap below).
 *   - no `text-transform`, no `letter-spacing` on exported text: the first
 *     shifts the .pptx away from the screen, the second is not measured.
 *   - colours come from tokens only, so the component follows a theme swap.
 *     A components-only pack has no theme of its own and lives entirely on
 *     the tokens every theme defines.
 *
 * Sizing: the host hands the component a plain block that already has the
 * body's height, so the component's own root takes `height: '100%'` and
 * distributes from there. `flex: 1` on the root does nothing — its parent is
 * not a flex container — and that is the single most common reason a
 * component renders as a short strip at the top of the body. Fixed pixel
 * heights are the other trap: they are what make a component overflow on the
 * one deck with a long tier name, and `src/export/overflow.ts` catches that
 * at export time, not while you are writing it.
 */
export function PricingSheet({ props }: { props: unknown }) {
  const { tiers, footnote } = props as PricingSheetProps;
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 'var(--space-4)' }}>
        {tiers.map((tier) => (
          <Column key={tier.name} tier={tier} />
        ))}
      </div>
      {footnote && (
        <div
          data-pptx="text"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}
        >
          {footnote}
        </div>
      )}
    </div>
  );
}

function Column({ tier }: { tier: PricingTier }) {
  const accent = tier.emphasis;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* The emphasised column's cap. A separate filled div rather than a
          border-top, because the exporter measures fills, not borders. */}
      <div
        data-pptx="shape"
        style={{
          height: 'var(--edge-panel)',
          background: accent ? 'var(--color-accent)' : 'var(--color-edge-muted)',
        }}
      />
      <div
        data-pptx="shape"
        style={{
          flex: 1,
          minHeight: 0,
          background: accent ? 'var(--color-accent-soft)' : 'var(--color-box-bg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div
          data-pptx="text"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-bold)',
            color: accent ? 'var(--color-accent-deep)' : 'var(--color-text-muted)',
          }}
        >
          {tier.name}
        </div>
        <div
          data-pptx="text"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--weight-bold)',
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {tier.price}
        </div>
        {tier.note && (
          <div
            data-pptx="text"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
          >
            {tier.note}
          </div>
        )}
        <div data-pptx="shape" style={{ height: 1, background: 'var(--color-box-border)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {tier.features.map((feature) => (
            <div
              key={feature}
              data-pptx="text"
              style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}
            >
              {/* A literal bullet character: a ::before marker draws nothing
                  the measurement pass can see, so the .pptx would lose it. */}
              {`• ${feature}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
