/**
 * Formatting helpers safe to import from client components.
 *
 * Kept separate from lib/seo.ts so a client bundle does not pull in the
 * server-side SEO/JSON-LD helpers alongside a number formatter.
 */

/** Format a PKR amount the way Pakistanis read it (crore / lakh). */
export function formatPkr(price: number, forRent = false): string {
  if (forRent) return `PKR ${price.toLocaleString()}/month`
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`
  return `PKR ${price.toLocaleString()}`
}

/** Compact form for tight spaces: "1.2 Cr", "45 Lakh". */
export function formatPkrShort(price: number): string {
  if (price >= 10000000) return `${(price / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`
  if (price >= 100000) return `${(price / 100000).toFixed(1).replace(/\.0$/, '')} Lakh`
  return price.toLocaleString()
}
