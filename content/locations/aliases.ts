/**
 * Bridges free-text location values to canonical taxonomy slugs.
 *
 * Listings store display names ("DHA Phase 6"), while the URL tree keys on
 * slugs (area `dha-defence` + subArea `phase-6`). Plain slugify() only
 * resolves ~23% of real values, so this map carries the rest.
 *
 * Entries are keyed by normalized text (lowercase, punctuation stripped).
 * City-scoped keys take the form `{citySlug}:{normalizedArea}` because the
 * same phrase maps differently per city — "DHA" is `dha-defence` in Lahore
 * but `dha` in Karachi.
 */

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_-]+/g, ' ')
    .trim()
}

/** Display-name / misspelling variants that map to a city slug. */
export const CITY_ALIASES: Record<string, string> = {
  'islamabad capital territory': 'islamabad',
  isb: 'islamabad',
  khi: 'karachi',
  lhr: 'lahore',
  rwp: 'rawalpindi',
  pindi: 'rawalpindi',
  'rawalpindi islamabad': 'rawalpindi',
  mirpurkhas: 'mirpur-khas',
  'dera ismail khan': 'dera-ismail-khan',
  'dg khan': 'dera-ghazi-khan',
  'dera ghazi khan': 'dera-ghazi-khan',
  'rahim yar khan': 'rahim-yar-khan',
  ryk: 'rahim-yar-khan',
  'wah cantt': 'wah-cantt',
  'toba tek singh': 'toba-tek-singh',
  'mandi bahauddin': 'mandi-bahauddin',
  swat: 'mingora',
  murree: 'rawalpindi',
}

export interface AreaAlias {
  areaSlug: string
  subAreaSlug?: string
}

/**
 * City-scoped area aliases: `{citySlug}:{normalizedArea}` → target.
 *
 * Only entries that plain slugify() gets wrong need to be here. Values that
 * already match a taxonomy slug (e.g. "Model Town" → `model-town`) resolve
 * without an alias.
 */
export const AREA_ALIASES: Record<string, AreaAlias> = {
  // ---- Lahore -------------------------------------------------------------
  'lahore:dha': { areaSlug: 'dha-defence' },
  'lahore:dha defence': { areaSlug: 'dha-defence' },
  'lahore:defence': { areaSlug: 'dha-defence' },
  'lahore:dha lahore': { areaSlug: 'dha-defence' },
  'lahore:gulberg i': { areaSlug: 'gulberg' },
  'lahore:gulberg ii': { areaSlug: 'gulberg' },
  'lahore:gulberg iii': { areaSlug: 'gulberg' },
  'lahore:gulberg 1': { areaSlug: 'gulberg' },
  'lahore:gulberg 2': { areaSlug: 'gulberg' },
  'lahore:gulberg 3': { areaSlug: 'gulberg' },
  'lahore:bahria orchard': { areaSlug: 'bahria-town' },
  'lahore:iqbal town': { areaSlug: 'allama-iqbal-town' },
  'lahore:johar town lahore': { areaSlug: 'johar-town' },
  'lahore:lahore cantt': { areaSlug: 'cantt' },
  'lahore:dha phase 9 prism': { areaSlug: 'dha-defence', subAreaSlug: 'phase-9-prism' },
  'lahore:dha phase 9': { areaSlug: 'dha-defence', subAreaSlug: 'phase-9-prism' },

  // ---- Karachi ------------------------------------------------------------
  'karachi:dha defence': { areaSlug: 'dha' },
  'karachi:defence': { areaSlug: 'dha' },
  'karachi:dha karachi': { areaSlug: 'dha' },
  'karachi:gulshan e iqbal': { areaSlug: 'gulshan-e-iqbal' },
  'karachi:gulshan iqbal': { areaSlug: 'gulshan-e-iqbal' },
  'karachi:gulistan e jauhar': { areaSlug: 'gulistan-e-jauhar' },
  'karachi:johar': { areaSlug: 'gulistan-e-jauhar' },
  'karachi:fb area': { areaSlug: 'federal-b-area' },
  'karachi:federal b area': { areaSlug: 'federal-b-area' },
  'karachi:p e c h s': { areaSlug: 'pechs' },
  'karachi:pechs': { areaSlug: 'pechs' },
  'karachi:north nazimabad': { areaSlug: 'north-nazimabad' },

  // ---- Islamabad ----------------------------------------------------------
  'islamabad:dha': { areaSlug: 'dha-islamabad' },
  'islamabad:dha defence': { areaSlug: 'dha-islamabad' },
  'islamabad:dha islamabad': { areaSlug: 'dha-islamabad' },
  'islamabad:gulberg': { areaSlug: 'gulberg-greens' },
  'islamabad:pwd': { areaSlug: 'pwd-housing' },
  'islamabad:simly dam': { areaSlug: 'simly-dam-road' },

  // ---- Rawalpindi ---------------------------------------------------------
  'rawalpindi:dha defence': { areaSlug: 'dha' },
  'rawalpindi:defence': { areaSlug: 'dha' },
}

/**
 * Generic structural patterns that appear across many cities, applied when no
 * explicit alias matched. Each returns `{ area, sub }` in *normalized* form,
 * to be resolved against the taxonomy by the caller.
 *
 * Handles the dominant Pakistani naming shapes:
 *   "DHA Phase 6"        → area "dha",        sub "phase 6"
 *   "Bahria Town Phase 8"→ area "bahria town",sub "phase 8"
 *   "F-8 Markaz"         → area "f 8",        sub "f 8 markaz"
 *   "Clifton Block 5"    → area "clifton",    sub "block 5"
 *   "G-11/4"             → area "g 11",       sub "g 11 4"
 */
export function splitStructuredArea(
  normalized: string
): { area: string; sub: string } | null {
  // "<name> phase <n>"  /  "<name> sector <x>"  /  "<name> block <x>"
  const m = normalized.match(/^(.*?)\s+(phase|sector|block)\s+([\w-]+)$/)
  if (m) return { area: m[1].trim(), sub: `${m[2]} ${m[3]}`.trim() }

  // "f 8 markaz" → area "f 8", sub "f 8 markaz"
  const markaz = normalized.match(/^([a-z])\s*(\d{1,2})\s+markaz$/)
  if (markaz) return { area: `${markaz[1]} ${markaz[2]}`, sub: `${markaz[1]} ${markaz[2]} markaz` }

  // "g 11 4" (from G-11/4) → area "g 11", sub "g 11 4"
  const sector = normalized.match(/^([a-z])\s*(\d{1,2})\s+(\d{1,2})$/)
  if (sector) {
    return { area: `${sector[1]} ${sector[2]}`, sub: `${sector[1]} ${sector[2]} ${sector[3]}` }
  }

  return null
}
