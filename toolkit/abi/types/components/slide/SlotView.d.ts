import type { SlotSpec } from '../../deck/layouts';
import type { DeckMeta } from '../../deck/schema';
import type { SetComponents } from '../../sets/types';
/**
 * Renders one slot (src/deck/layouts.ts, `SlotSpec`) — the shared "one piece
 * of content" vocabulary behind a `split` side and a freeform `component`
 * item. One renderer for both, so a kind cannot mean two different things
 * depending on which layout reached it.
 *
 * `path` is the slot's own location in the slide props (`"left"`,
 * `"items.2.content"`), and every payload hangs off it under the key the
 * type declares: `${path}.block`, `${path}.events`, `${path}.columns.0`.
 * The components stamp their own `data-item`/`data-edit` from that, so the
 * inline editor addresses a block inside a freeform item exactly as it
 * addresses one inside a split side.
 *
 * The wrappers carry `flex: 1` wherever the content has no height of its
 * own (a chart in a zero-height box measures to nothing, which is the
 * failure that ships a blank PPTX region). A grid item ignores `flex`, so
 * this is inert for `split` and load-bearing for freeform, whose item box
 * is a flex column sized by `area.h` as a floor.
 */
export declare function SlotView({ slot, path, meta, components, }: {
    slot: SlotSpec;
    path: string;
    /** Only the `extension` kind needs these two — a slot that never names an
     * extension renders without them. */
    meta?: DeckMeta;
    components?: SetComponents;
}): import("react").JSX.Element | null;
