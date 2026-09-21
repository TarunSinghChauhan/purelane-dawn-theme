# Build notes

## What I built
Hero, shop grid, best-selling combos, bundles and reviews rail as Dawn sections, plus an optional backdrop section
(the fixed gradient/water layer the glass cards sit on). Product cards, prices, images and icons are shared snippets.
Prices, savings, per-product prices and product counts are computed from Shopify data; nothing is typed into Liquid.

**Data model.** Products carry a few `custom.*` metafields. Combos are real bundle products (native price/compare-at/URL)
with a `bundle_items` list. Bundle tiers and reviews are metaobjects. The hero's price flag reads the same tier entries.
See `DEFINITIONS.md`.

## What I'd flag about the original file
1. **Shop grid is 4 products rendered twice.** The first row's images are empty spans with a CSS background and no
   height, so they collapse to nothing on screens over 760px (blank image slots). The second row uses inline SVG and works.
2. **`.qty` collision.** A quantity-stepper rule from the product-page CSS leaks onto the bundle tiers' number and draws
   a stray bordered box round "2 / PRODUCTS". Not reproduced.
3. **Two stylesheets fighting.** A dark theme plus a light "V2" override, ~150 KB with base64 art, dead product-page
   rules, and a leftover dark drop-shadow on the hero.
4. **Performance:** `offsetTop` measured for every section on every scroll frame; a perpetual JS animation on the hero's
   `filter`; full-screen `mix-blend-mode` layers animating behind everything; render-blocking Google Fonts including an
   unused Outfit weight.
5. **Marquee:** the five cards are duplicated by hand (screen readers read every review twice), `gap` leaves a 6px jump
   at the loop point, and under reduced motion it freezes on the first cards with no way to scroll.
6. **Accessibility:** h2 to h4 heading jumps, 6px slider dots, an auto-rotating hero with no pause, a scroll rail with no
   keyboard access, `.rv` hides content when JS is off, and small text at about 3.5-4:1 contrast.
7. **Content inconsistencies:** "Complete home bundle" says 5 products but shows 3 thumbnails that aren't the ones in the
   "Includes" line; toilet cleaner has two different benefit lines; 1,495 vs 1495; "Flat 174 per product" is 174.5
   rounded half-to-even while 160 is 159.8 rounded up (Liquid rounds to 175); the combos note promises a bundle picker
   that doesn't exist in the file.
8. Cards weren't links and the buttons did nothing.

## What I changed, and why
- Rebuilt the top-row image sizing so all cards show product art (the intended design, the working second row).
- Reveal only hides content when `html.js` is present; the theme editor and reduced motion show everything.
- Marquee: one copy of each review in the markup, clones made in JS (`aria-hidden`), duration scales with review count,
  normal scrolling strip when JS or motion is off, and an offscreen pause button that appears on focus.
- Scene switching uses one IntersectionObserver; hero rotation pauses when off-screen, hovered, focused or paused.
- Ambient hero shadow animation removed (kept the static shadow).
- Badge rail and badge strip are one list restyled by breakpoint. Small text colours darkened slightly for contrast.
- Sold-out cards, no-image tiles and long-title clamping were not in the design; added with the existing tokens.
- Every component selector is scoped under `.pl`, so nothing collides with Dawn's `.card`/`.button`.

## Verification, honestly
First pass: a LiquidJS harness with mock data, screenshots against the original at 1440 and 375px in headless Chromium.
Second pass, on a real dev store (purelane-tarun) through `shopify theme dev`, which found problems the harness could not:
- Shopify's validator rejected a section name over 25 characters and a `{}` placeholder inside a setting string.
- Dawn's newer layout puts every section in a three-column grid; sections needed the `full-width` class or the
  hero's fade rendered as a hard-edged box.
- Money metafields do not expose `.amount` in Liquid (they read as minor units), and switching the store currency
  converted the stored prices. The tier prices are now Decimal fields.
- Metaobject entries come back in creation order, so tiers are now sorted by quantity.
Checked by eye on the store at desktop width: hero rotation and price flag, reviews rail, combos, bundles, shop grid.
NOT done: a 375px pass on the real store, Lighthouse runs, a full add/remove/reorder cycle in the theme editor,
keyboard and screen-reader testing.

## With more time
Theme-editor test pass, Lighthouse runs, a proper Shopify Bundles hookup for "Shop bundle", a variant picker on cards,
the remaining prototype sections, self-hosted fonts via `font_picker`, and prev/next buttons on the combo rail.

# AI workflow notes

**Delegated:**
- Reading the 1,700-line prototype and listing its defects
- Extracting the base64 art into PNGs
- First drafts of the sections
- The Liquid harness and screenshot diffing, and the seed CSV

**Where it failed:**
- The first hero render collapsed: every section re-links `pl-base.css`, and its resets outranked the component rules. The fix was `:where()` resets plus `.pl`-scoped component CSS.
- On the real store it got the money-field handling wrong (twice) and missed Dawn's `full-width` grid class. I found those by running it and pasting the errors back.

**Human judgement:**
- Which deviations from the prototype are defects and which are design
- The data model: bundle products plus metaobjects instead of hard-coded tiers
- Setting up the store, the data and the repo myself

**With twenty more of these:**
- A section spec template (settings, data source, states)
- The shared snippets and reset scoping as a starter kit
- The harness plus a pixel-diff gate in CI, and a Liquid lint step
