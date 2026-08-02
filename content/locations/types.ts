/**
 * Location taxonomy that powers the programmatic SEO URL tree:
 *   /residential/[city]
 *   /residential/[city]/[area]
 *   /residential/[city]/[area]/[subarea]
 *   /residential/[city]/[area]/[subarea]/[ad-slug]   (property detail)
 *   …and the same under /commercial
 */

export interface SubArea {
  /** kebab-case, URL segment, e.g. "block-18", "phase-6", "sector-g-13" */
  slug: string
  /** display name, e.g. "Block 18", "Phase 6", "G-13" */
  name: string
}

export interface Area {
  slug: string
  name: string
  /** Blocks / phases / sectors — only where they genuinely exist for this area. */
  subAreas?: SubArea[]
}

export interface City {
  slug: string
  name: string
  /** Punjab | Sindh | KPK | Balochistan | Islamabad Capital Territory | Azad Kashmir | Gilgit-Baltistan */
  province: string
  /** 2–3 sentence unique SEO intro for the city hub pages. */
  intro: string
  /** One-line market-flavour sentence reused on category pages. */
  marketNote: string
  areas: Area[]
}
