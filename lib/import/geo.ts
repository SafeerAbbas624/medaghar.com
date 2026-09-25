/**
 * Coordinates for bulk-imported listings.
 *
 * Collected data gives a location in whatever form the agent had to hand:
 * two numeric columns, a "33.68, 73.04" pair, or a Google Maps link copied
 * from the share sheet. Links come in a dozen shapes, and the short
 * maps.app.goo.gl form hides the coordinates behind a redirect.
 */

export interface LatLng {
  lat: number
  lng: number
}

/** Generous box around Pakistan incl. AJK and Gilgit-Baltistan. */
const PK_BOUNDS = { minLat: 23.5, maxLat: 37.2, minLng: 60.8, maxLng: 77.9 }

export function inPakistan(p: LatLng): boolean {
  return (
    p.lat >= PK_BOUNDS.minLat &&
    p.lat <= PK_BOUNDS.maxLat &&
    p.lng >= PK_BOUNDS.minLng &&
    p.lng <= PK_BOUNDS.maxLng
  )
}

/** Great-circle distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Accept a pair only if it lands in Pakistan, un-swapping lat/lng when the
 * columns were entered the wrong way round (a common spreadsheet slip —
 * Pakistan's longitudes never overlap its latitudes, so it is unambiguous).
 */
export function checkPair(lat: number, lng: number): { point: LatLng; swapped: boolean } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (inPakistan({ lat, lng })) return { point: { lat, lng }, swapped: false }
  if (inPakistan({ lat: lng, lng: lat })) return { point: { lat: lng, lng: lat }, swapped: true }
  return null
}

const NUM = String.raw`-?\d{1,3}(?:\.\d+)?`

/** "33.6844, 73.0479" / "33.6844 73.0479" / "33.6844,+73.0479" */
export function parseLatLngText(text: string): LatLng | null {
  const t = decodeURIComponent(text.replace(/\+/g, ' ')).trim()
  const m = t.match(new RegExp(`^(${NUM})\\s*[,\\s]\\s*(${NUM})$`))
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  return parseDms(t)
}

/** 33°41'03.8"N 73°02'52.4"E — what Google shows when you drop a pin. */
function parseDms(text: string): LatLng | null {
  const re = /(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)?["″]?\s*([NSEW])/gi
  const parts: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) && parts.length < 2) {
    let v = parseInt(m[1]) + parseInt(m[2]) / 60 + (m[3] ? parseFloat(m[3]) / 3600 : 0)
    if (/[SW]/i.test(m[4])) v = -v
    parts.push(v)
  }
  return parts.length === 2 ? { lat: parts[0], lng: parts[1] } : null
}

/**
 * Pull coordinates out of a full Google Maps URL.
 *
 * Order matters: `!3d..!4d..` is the dropped pin / place itself, while
 * `/@lat,lng,zoom` is only where the map viewport was centred.
 */
export function parseMapsUrl(raw: string): LatLng | null {
  const url = raw.trim()
  if (!url) return null

  if (/^geo:/i.test(url)) return parseLatLngText(url.slice(4).split(/[?;]/)[0])

  const pin = url.match(new RegExp(`!3d(${NUM})!4d(${NUM})`))
  if (pin) return { lat: parseFloat(pin[1]), lng: parseFloat(pin[2]) }

  let parsed: URL | null = null
  try {
    parsed = new URL(url)
  } catch {
    // Not a URL — maybe a bare pair pasted into the link column.
    return parseLatLngText(url)
  }

  for (const key of ['q', 'query', 'll', 'sll', 'center', 'destination', 'daddr', 'saddr', 'viewpoint']) {
    const v = parsed.searchParams.get(key)
    if (v) {
      const p = parseLatLngText(v.replace(/^loc:/i, ''))
      if (p) return p
    }
  }

  // /maps/place/33.68,73.04/…  or  /maps/search/33.68,+73.04
  const pathPair = parsed.pathname.match(
    new RegExp(`/(?:place|search|dir)/(${NUM})\\s*,\\s*\\+?(${NUM})`)
  )
  if (pathPair) return { lat: parseFloat(pathPair[1]), lng: parseFloat(pathPair[2]) }

  const decodedPath = decodeURIComponent(parsed.pathname)
  const placeDms = parseDms(decodedPath)
  if (placeDms) return placeDms

  const viewport = url.match(new RegExp(`/@(${NUM}),(${NUM})`))
  if (viewport) return { lat: parseFloat(viewport[1]), lng: parseFloat(viewport[2]) }

  return null
}

export function isShortMapsLink(url: string): boolean {
  return /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|maps\.google\.com\/\?cid=)/i.test(
    url.trim()
  )
}

/**
 * Follow a short link's redirects (without loading the final page) until a
 * URL with coordinates appears. Returns null when the link only names a
 * place — those need a manual pin.
 */
export async function resolveShortMapsLink(url: string, timeoutMs = 10000): Promise<LatLng | null> {
  let current = url.trim()
  for (let hop = 0; hop < 6; hop++) {
    const found = parseMapsUrl(current)
    if (found && hop > 0) return found
    let res: Response
    try {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'User-Agent': 'Mozilla/5.0 (MedaGhar listing import)' },
      })
    } catch {
      return null
    }
    const next = res.headers.get('location')
    // Discard the body; only the redirect target is needed.
    res.body?.cancel().catch(() => {})
    if (!next) return null
    current = new URL(next, current).toString()
  }
  return parseMapsUrl(current)
}
