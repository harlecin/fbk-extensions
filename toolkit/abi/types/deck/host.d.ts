/** Called by the preview app in `?embed=1` mode, before the first render. */
export declare function setEmbeddedHost(value: boolean): void;
export declare function isEmbeddedHost(): boolean;
/**
 * "Install this extension" from inside a slide. The editor owns the
 * Extensions dialog; the preview only says which extension the user asked
 * for (src/editor/preview-bridge.ts).
 */
export declare function requestInstallExtension(extensionId: string): void;
