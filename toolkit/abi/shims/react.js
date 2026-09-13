// Injected into every theme pack in place of `react` (tools/pack-set.ts).
// A pack must never bundle its own React: two copies in one page are two
// renderers, and a platform component built by one cannot be rendered by the
// other. The app publishes the live one on globalThis before it imports a
// pack (src/sets/runtime.ts).
const runtime = globalThis.__FBK_SET_RUNTIME__;
if (!runtime) {
  throw new Error('This theme was loaded without the Folien Baukasten set runtime.');
}
const React = runtime.react;
export default React.default ?? React;
export const {
  Children, Fragment, StrictMode, Suspense, cloneElement, createContext,
  createElement, forwardRef, isValidElement, lazy, memo, startTransition,
  useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId,
  useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo,
  useReducer, useRef, useState, useSyncExternalStore, useTransition,
} = React;
