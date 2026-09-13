/**
 * Acme Slate — the pack's entry point.
 *
 * Everything an installed extension is comes out of this one default export:
 * the theme's identity, its chrome, and the slide components it ships.
 * `tools/pack-set.ts` bundles this file into the pack's `set.js`, and
 * `src/sets/loader.ts` imports that and hands the result to the renderer —
 * so what is exported here is exactly what the app consumes.
 *
 * Two import specifiers are special. `react` and `@folienbaukasten/platform`
 * are NEVER bundled: they resolve at load time to the app's live instances,
 * because two copies of React in one page is two renderers. Import anything
 * else you like — it gets bundled into set.js, and its bytes are your
 * pack's size.
 */
import type { ComponentSet } from '@folienbaukasten/platform';
import './theme.css';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PricingSheet } from './components/PricingSheet';
import { Flow } from './components/Flow';

const acme: ComponentSet = {
  /** Must match `id` in pack.json — it is the namespace of every component
   * kind below, and the value a deck records as `meta.componentSet`. */
  id: 'acme',
  name: 'Acme Slate',
  description: 'Slate and teal, built for pricing and process reviews.',
  /** Offer it in the theme chooser. Without this the theme installs and is
   * listed under Installed, but no user can pick it — pack-set warns. */
  production: true,
  chrome: { Header, Footer },
  /**
   * Slide bodies this pack ships, keyed by namespaced kind. Every kind here
   * must also be declared in pack.json — that is where its description,
   * prop schema, glyph and example come from — and the two lists are checked
   * against each other by nothing, so keep them together in your head.
   */
  components: {
    'acme/pricing-sheet': { component: PricingSheet },
    // Animated: unmeasurable, so it only validates in a Web Mode deck. The
    // same flag is declared in pack.json, which is what the app reads.
    'acme/flow': { component: Flow, webOnly: true },
  },
  /**
   * A theme may also replace the platform's view of a layout it already has:
   *   overrides: { title: MyTitleSlideView },
   * It may never ADD a layout. The vocabulary is the platform's, which is
   * what makes every deck render under every theme.
   */
};

export default acme;
