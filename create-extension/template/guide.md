# __NAME__ — how to use this theme

This theme is for commercial material: pricing, offers, process reviews.
Slate is the structure; the teal accent is the one thing on a slide that must
not be missed. Use it once per slide — as `header.highlight`, as one
emphasised card, or as the one recommended tier — never twice.

There is no logo slot: `meta.logoUrl` is ignored, so do not ask the user for
one.

## The two components

**`__ID__/pricing-sheet`** — two to four tiers side by side, exactly one of
them `emphasis: true`. This is the slide that puts an offer in front of a
buyer, so the header should say what the *recommendation* is
("Business is the tier that pays back in month four"), not "Pricing". Prices
are printed verbatim, including currency and period; never pass a bare
number. Three to five feature lines per tier — past five the columns stop
being comparable from the back of a room.

**`__ID__/flow`** — three to six process stages as an arrow chain, one lit via
`focus`. **Web Mode only**: it animates. If the deck is in PowerPoint mode,
do not use it — reach for a `timeline` or `process` slide instead, or tell
the user the deck would have to activate Web Mode first.

A `component` slide still carries a header, and the header still has to make
the point. A component that draws four tiers under the title "Pricing" has
wasted the top third of the slide.

## Anything else

Every other layout is the platform's own and behaves normally here. The
theme's edge signature is a top rule, so `two-block` and `three-block` slides
read as columns; use `callout` sparingly, since its left edge is the one
place the grammar breaks on purpose.
