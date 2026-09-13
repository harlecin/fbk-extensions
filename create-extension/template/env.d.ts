/**
 * A stylesheet import is a bundler instruction, not a module with a type.
 * The app's own tsconfig gets this declaration from `vite/client`; an
 * extension that does not depend on vite declares it here.
 */
declare module '*.css';
