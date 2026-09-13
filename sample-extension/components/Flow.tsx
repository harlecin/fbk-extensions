import type { FlowProps } from '../components.ts';

/**
 * `acme/flow` — a WEB-ONLY extension component.
 *
 * It animates, so nothing the exporter measures could reproduce it. That is
 * declared twice and both declarations are load-bearing:
 *
 *   - `webOnly: true` on the component in `index.ts`, and
 *   - `"webOnly": true` on its entry in `pack.json` — this is the one the
 *     app reads. It makes the component invisible to the model and rejected
 *     by validation until the deck has pressed **Activate Web Mode**.
 *
 * Never declare an animated or canvas-drawn component PPTX-safe: it would
 * export as a silently blank region, which is the failure nobody traces back
 * to here.
 *
 * ## The three rules an entrance animation has to keep
 *
 * The platform's own animated components (`src/base.css`, the KPI tiles) do
 * exactly this, and a component that skips any of it misbehaves in a way its
 * author will not see on screen:
 *
 *  1. **Scope it to `section.present`.** Reveal keeps every slide in the DOM.
 *     Unscoped, slide 12's stages finish animating while the viewer is still
 *     on slide 1, and nobody ever sees the effect.
 *  2. **The resting state is the real state.** Animate with `both` from a
 *     hidden keyframe rather than setting `opacity: 0` in the element's own
 *     style — so with animations off, the component is simply *there*.
 *  3. **Honour the two kill switches.** `html[data-still]` is set by every
 *     capture path (export, thumbnails, the screenshot harness), and
 *     `prefers-reduced-motion` is set by the viewer. Both must land on the
 *     finished frame: a thumbnail shot mid-flight is a half-empty slide in
 *     the film strip.
 *
 * Web-only buys the whole browser — CSS animation, transitions, gradients,
 * `clip-path` — but not the tokens: colours still come from the theme, so
 * the component follows a theme swap like everything else.
 */
export function Flow({ props }: { props: unknown }) {
  const { stages, focus } = props as FlowProps;
  return (
    <div
      style={{
        // height: '100%', not flex: 1 — see the note in PricingSheet.tsx.
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
        gap: 'var(--space-3)',
      }}
    >
      {stages.map((stage, i) => {
        const lit = focus === undefined || focus === i + 1;
        return (
          <div
            key={stage.title}
            className="acme-flow-stage"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-5)',
              // No radius on a notched stage: the clip would cut the corners
              // off anyway and the two shapes fight.
              borderRadius: i === stages.length - 1 ? 'var(--radius)' : 0,
              background: lit
                ? 'linear-gradient(140deg, var(--gradient-accent-from), var(--gradient-accent-to))'
                : 'var(--color-box-bg)',
              color: lit ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
              // The stagger, one step per stage: four stages that appear at
              // once read as a row, four that arrive left to right read as a
              // sequence someone is walking you through.
              animationDelay: `${i * 140}ms`,
              // A clipped notch, so the stages read as an arrow chain.
              clipPath:
                i === stages.length - 1
                  ? undefined
                  : 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)',
            }}
          >
            {stage.duration && (
              <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-kicker)' }}>
                {stage.duration.toUpperCase()}
              </div>
            )}
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>
              {stage.title}
            </div>
            {stage.note && <div style={{ fontSize: 'var(--text-sm)' }}>{stage.note}</div>}
          </div>
        );
      })}
      {/*
        Keyframes and the two kill switches have to live somewhere the pack
        carries. A theme could put them in theme.css — but a components-only
        pack has no set.css at all (the loader would never link it), so a
        <style> element beside the markup is the portable place for them, and
        the one that keeps a component self-contained.
      */}
      <style>{`
        @keyframes acme-flow-in {
          from { opacity: 0; transform: translateY(12px); }
        }
        .reveal .slides section.present .acme-flow-stage {
          animation: acme-flow-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        html[data-still] .reveal .slides section.present .acme-flow-stage {
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal .slides section.present .acme-flow-stage { animation: none; }
        }
      `}</style>
    </div>
  );
}
