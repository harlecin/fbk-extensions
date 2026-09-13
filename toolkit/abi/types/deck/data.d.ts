/** What a spreadsheet cell can hold once read. `null` is an empty cell. */
export type CellValue = string | number | boolean | null;
/** One sheet's used range, row-major. Rows may be ragged; readers pad. */
export interface DataSheet {
    /** Sheet name as the workbook spells it — the middle part of a `$ref`. */
    name: string;
    cells: CellValue[][];
}
/** One imported workbook, snapshotted into the deck. */
export interface DataSource {
    /**
     * Short slug the refs name it by, unique within the deck (`plan`,
     * `fy28-actuals`). Stable across refreshes — renaming a source would
     * silently break every ref that points at it.
     */
    id: string;
    /** What to call it in the UI, e.g. "FY28 Plan". */
    name: string;
    /** Original file name, kept for the UI and for re-import. */
    fileName: string;
    /**
     * Absolute path of the file this came from, for Refresh. Absent when the
     * source was pasted, or when the deck arrived from another machine and the
     * path was deliberately dropped.
     */
    path?: string;
    /** ISO timestamp of the last import or refresh. */
    importedAt: string;
    sheets: DataSheet[];
}
/**
 * A pointer to a range in a `DataSource`, in place of a literal prop value.
 *
 * The one-key object shape is deliberate: it is unambiguous inside arbitrary
 * JSON (no string prop can be mistaken for one), it survives every deck patch
 * path unchanged, and a deck that reaches a machine with an older build shows
 * up as a validation error naming the ref rather than as a silently empty
 * chart.
 */
export interface DataRef {
    $ref: string;
}
export declare function isDataRef(value: unknown): value is DataRef;
/** Zero-based row/column bounds of a rectangular range, inclusive. */
interface RangeBounds {
    r0: number;
    c0: number;
    r1: number;
    c1: number;
}
/** 0 → "A", 26 → "AA". The inverse, for the UI's range hints. */
export declare function columnName(index: number): string;
/** How a ref reshapes the rectangle it read. See `ParsedRef`. */
export interface RefOptions {
    /** `cols` transposes before anything else, so a metric down a column
     * reads as a row. Default `rows`. */
    orient: 'rows' | 'cols';
    /** First row (after `orient`) is a header: yield objects keyed by it. */
    header: boolean;
    /**
     * Collapse a degenerate rectangle: 1×1 becomes a scalar and 1×N or N×1 a
     * flat array. Default true — it is what makes `{"$ref":"…!B2"}` usable as
     * a KPI value. `collapse=none` keeps the 2-D array.
     */
    collapse: boolean;
}
export interface ParsedRef {
    sourceId: string;
    /** Absent = the source's first sheet. */
    sheet?: string;
    /** Absent = the sheet's whole used range. */
    range?: RangeBounds;
    options: RefOptions;
}
/**
 * `"<source>[!<sheet>][!<range>]"` with an optional `?opt=value&…` tail.
 *
 * The sheet is optional and the range is optional, which leaves `a!b`
 * ambiguous — it is read as a range when it looks like A1 notation and as a
 * sheet name otherwise. A sheet genuinely called "B2" therefore needs its
 * range spelled out (`plan!B2!A1:D9`); that is the whole cost of letting the
 * common forms stay short.
 */
export declare function parseRef(ref: string): ParsedRef | {
    error: string;
};
/**
 * A deep copy of `value` with every `{ $ref }` replaced by what it points at.
 *
 * A ref that cannot be resolved is left in place, and its reason is pushed
 * onto `errors`. Leaving it is what lets the two callers differ: validation
 * reports the errors and refuses, while rendering shows the rest of the slide
 * — a deck with one dead ref should still open.
 */
export declare function resolveValue(value: unknown, sources: DataSource[], errors?: string[], path?: string): unknown;
/** What `resolveDeck` hands back: the deck to render, and what went wrong. */
export interface ResolvedDeck<T> {
    deck: T;
    errors: string[];
}
/**
 * Resolve every ref in a deck's slides.
 *
 * `meta` and `data` are copied through untouched: a ref in the header of the
 * deck's own metadata would be resolvable but is not a thing anyone needs,
 * and refs *inside* the snapshot would be a loop.
 *
 * A deck with no `data` and no refs short-circuits to the identical object,
 * so the common case costs one property read — this runs on every render.
 */
export declare function resolveDeck<T extends {
    meta: unknown;
    slides: unknown[];
    data?: DataSource[];
}>(deck: T): ResolvedDeck<T>;
/** Whether anything in `value` is a ref — the render-path fast exit. */
export declare function hasRef(value: unknown): boolean;
/**
 * Structural check on `deck.data` itself, before anything tries to read it.
 * Kept separate from ref resolution because the two fail for opposite
 * reasons: this catches a malformed *import*, that catches a bad *pointer*.
 */
export declare function validateDataSources(value: unknown): string[];
/** Every ref string in a deck, in document order — the UI's "what uses this
 * source" answer, and what a source cannot be removed out from under. */
export declare function collectRefs(value: unknown, out?: string[]): string[];
export {};
