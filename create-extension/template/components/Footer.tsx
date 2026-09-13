import type { DeckMeta } from '@folienbaukasten/platform';

/**
 * The footer band: a hairline, the deck's footer note, the slide number.
 *
 * The hairline is `data-pptx="shape"` — a 1px filled div. Note what it is
 * NOT: a border. Per-side borders and box-shadows do not survive the
 * measurement pass (it reads one `backgroundColor` per shape), so rules and
 * two-tone bars are built as adjacent filled divs.
 */
export function Footer({ meta, slideNumber }: { meta: DeckMeta; slideNumber: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div data-pptx="shape" style={{ height: 1, background: 'var(--color-box-border)' }} />
      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span data-pptx="text">{meta.footer ?? meta.title}</span>
        <span data-pptx="text">{slideNumber}</span>
      </div>
    </div>
  );
}
