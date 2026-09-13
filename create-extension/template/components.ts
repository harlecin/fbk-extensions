/**
 * The prop types of every component this pack ships.
 *
 * This file is not imported by anything at runtime — it is the *schema
 * source*. `pack.json` names an exported interface per component
 * (`"schemaType": "PricingSheetProps"`) and the packer generates that
 * interface's JSON Schema from the TypeScript here, with the same generator
 * the platform's own catalog uses.
 *
 * That schema is what the model writes props against and what ajv validates
 * a deck with, so the doc comments below are not decoration: they are the
 * only instructions the model gets about each field. Write them for a reader
 * who has never seen this component.
 *
 * The rule of thumb: describe what the field MEANS on the slide, and say
 * when not to use it. Ranges and counts belong here too — "three to five" is
 * advice a schema can carry and a type cannot.
 */

/** One column of the pricing sheet. */
export interface PricingTier {
  /** Tier name, one or two words: "Team", "Business", "Enterprise". */
  name: string;
  /** Headline price as it should be printed, including the currency and any
   * period: "€49 / user / month", "On request". Never a bare number — the
   * component does no formatting, because the unit is part of the offer. */
  price: string;
  /** One line under the price saying who the tier is for. */
  note?: string;
  /** Three to five short capability lines. More than five and the columns
   * stop being comparable at projector distance. */
  features: string[];
  /** Mark exactly one tier as the recommendation. A sheet where every column
   * is emphasised has emphasised nothing. */
  emphasis?: boolean;
}

/** Props for `__ID__/pricing-sheet`. */
export interface PricingSheetProps {
  /** Two to four tiers, cheapest first. */
  tiers: PricingTier[];
  /** Optional line under the columns: the condition the prices assume
   * ("Annual commitment, billed up front"). */
  footnote?: string;
}

/** One stage of the flow. */
export interface FlowStage {
  /** Stage name, two or three words. */
  title: string;
  /** One line on what happens in this stage. */
  note?: string;
  /** How long the stage takes, as printed: "2 weeks", "Q3". */
  duration?: string;
}

/** Props for `__ID__/flow` — WEB MODE ONLY (the stages animate in). */
export interface FlowProps {
  /** Three to six stages, in order. */
  stages: FlowStage[];
  /** 1-based index of the stage the slide is about; it stays lit while the
   * others fade back. Omit when no stage is the point. */
  focus?: number;
}
