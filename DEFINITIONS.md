# Metafield and metaobject definitions

Create these in Settings > Metafields and metaobjects before importing the products. Turn on Storefront access for each.
Set the store currency to INR before typing any prices: prices entered while the store was in USD were converted at the
exchange rate when the currency changed.

## Product metafields (namespace `custom`)
| Name | Key | Type | Used by |
|---|---|---|---|
| Badge | `badge` | Single line text | Shop card pill, combo flag |
| Rating | `rating` | Decimal | Shop card rating |
| Rating count | `rating_count` | Integer | Shop card review count |
| Short name | `short_name` | Single line text | "Includes" line, review product label |
| Benefit | `benefit` | Single line text | Caption under each bottle in a combo |
| Bundle items | `bundle_items` | List of products | Combo tray, count and "Includes" (on bundle products) |
| Save label | `save_label` | Single line text | Overrides "You save" chip |
| Highlight | `highlight` | True / false | Gold-bordered combo with primary button |
| Summary | `summary` | Multi-line text | Sentence after "Includes" |

Image convention: a product's 1st image is the pack shot; its 2nd image is the bottle shot the hero uses.

## Metaobject `pl_bundle_tier`
| Field label | Key | Type |
|---|---|---|
| Label | `label` | Single line text |
| Quantity | `quantity` | Integer |
| Bundle price | `bundle_price` | Decimal (rupees, e.g. 349) |
| Compare at price (optional) | `compare_at_price` | Decimal (empty = sum of the listed products' MRPs) |
| Products | `products` | List of products |
| Image (optional) | `image` | File (image) |
| Perks | `perks` | List of single line text |
| Is featured | `is_featured` | True / false |
| Link | `link` | URL |
| Cta label (optional) | `cta_label` | Single line text |

Entries: Starter (2, 349), Most popular (3, 499, featured), Whole home (5, 799). The section sorts by quantity.
Tier prices are Decimal, not Money: a Money value reads as minor units in Liquid and follows the store currency.

## Metaobject `pl_review`
| Field label | Key | Type |
|---|---|---|
| Title | `title` | Single line text |
| Body | `body` | Multi-line text |
| Author | `author` | Single line text (blank = "Verified buyer") |
| Product | `product` | Product |
| Stars | `stars` | Integer (1-5) |
