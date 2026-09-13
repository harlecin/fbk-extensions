// Injected in place of `react/jsx-runtime` and `react/jsx-dev-runtime`.
// See tools/set-shims/react.js for why a pack may not bundle its own.
const runtime = globalThis.__FBK_SET_RUNTIME__;
if (!runtime) {
  throw new Error('This theme was loaded without the Folien Baukasten set runtime.');
}
const jsxRuntime = runtime.jsxRuntime;
export const Fragment = jsxRuntime.Fragment;
export const jsx = jsxRuntime.jsx;
export const jsxs = jsxRuntime.jsxs;
// The dev runtime's extra arguments are ignored by the production one, which
// is what a pack is always built against.
export const jsxDEV = jsxRuntime.jsx;
