import type { ComponentType } from 'react';
import type { SharedSlide } from '../../deck/layouts';
import type { LayoutName, ResolvedSet, SlideViewProps, ThemeSet } from '../../sets/types';
/**
 * The platform's default view for every layout in the shared vocabulary.
 * Typed against `SharedSlide`, so adding a layout without a default view is
 * a compile error — this is where the old per-set registry exhaustiveness
 * check now lives.
 */
export declare const platformDefaults: {
    [L in LayoutName]: ComponentType<SlideViewProps<Extract<SharedSlide, {
        layout: L;
    }>>>;
};
/**
 * Resolve a set's layout registry: platform defaults merged with the set's
 * overrides. A missing override is not an error state — it is the normal
 * case. Lives here rather than in the loader so the standalone template
 * (which pins one set at build time and never sees the loader's glob) can
 * resolve without pulling every set into its bundle.
 */
/**
 * @param extensionComponents components from installed packs that provide
 *   them (src/sets/loader.ts). Kinds are namespaced by pack id, so the set's
 *   own components cannot collide with them; the set's win if one does.
 */
export declare function resolveSet(set: ThemeSet, extensionComponents?: ResolvedSet['components']): ResolvedSet;
