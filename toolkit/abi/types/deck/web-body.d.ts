import type { WebSlideSpec } from './layouts';
/** Everything in `html` + `css` + `js` together. A body larger than this is
 * a mistake: it lands in deck.json, which is loaded, patched and diffed. */
export declare const WEB_BODY_MAX_BYTES: number;
/**
 * Where an image may come from. A data URI, or the app's own root-relative
 * space (`/project/assets/…`, `/logo.svg`) — which is also what the
 * standalone export knows how to inline. Everything else is the network, and
 * the network is not available to a slide (WEB-MODE.md rule 6).
 */
export declare function isSafeUrl(value: string): boolean;
/**
 * Everything wrong with one web body, phrased for the model — the same
 * round-trip that carries schema errors and fit findings back to it. `prefix` addresses the slide
 * the way validation messages do: `slides[4].props`.
 */
export declare function lintWebBody(
/** `js` is tier B and not in the schema yet;
 * the checks for it are written here because the day it lands is the wrong
 * day to be inventing the message a model gets back. */
props: WebSlideSpec['props'] & {
    js?: string;
}, prefix: string): string[];
/**
 * Rewrite the author's stylesheet so every rule applies inside `scope` and
 * nowhere else: one slide cannot restyle another slide, the chrome, or the
 * editor around it.
 *
 * `:root`, `html` and `body` are rewritten to the scope itself rather than
 * dropped — a body that declares its own custom properties on `:root` is
 * doing the right thing, and it should land on the box it owns.
 */
export declare function scopeWebCss(css: string, scope: string): string;
/**
 * The author's markup, rebuilt from a parsed tree with everything the body
 * may not have removed. Browser only (it needs a parser); the lint above is
 * what runs everywhere else.
 *
 * This is a *correctness* boundary rather than a security one — a tier-A
 * body has no scripts by construction, so there is nothing to contain. Its
 * job is to stop a confused model from breaking the page around it.
 *
 * `text` fills the elements the body marked `data-edit="text.…"`: the copy
 * lives in the deck, so editing a line is a write to `props.text` and the
 * markup never has to be rewritten.
 */
export declare function sanitizeWebHtml(html: string, text?: Record<string, string>): string;
