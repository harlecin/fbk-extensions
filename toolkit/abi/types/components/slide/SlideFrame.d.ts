import type { ReactNode } from 'react';
/**
 * Fixed 1280×720 canvas with safe-area margins; every layout renders inside
 * one. The `slide-frame` class carries the platform's chrome-containment
 * rules (src/base.css): the header and footer bands are reserved, so an
 * oversized body clips instead of pushing the footer off the canvas.
 *
 * Platform-owned: sets style the frame through tokens but cannot replace it,
 * so the containment contract holds for every set by construction.
 */
export declare function SlideFrame({ children, bleed, }: {
    children: ReactNode;
    /**
     * Drop the safe-area margins so the body owns the canvas edge to edge
     * (the `web` layout's full-bleed opener). The frame
     * becomes the positioning context, because chrome that still has to sign a
     * bleed slide has nowhere else to sit.
     */
    bleed?: boolean;
}): import("react").JSX.Element;
