/**
 * Real headline numbers for the homepage and About page.
 *
 * Demo inventory (listingSource = 'SHOWCASE') and the demo agents who hold it
 * are excluded, so the figures only ever describe real listings and people.
 */

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CITIES } from '@/lib/locations'

export interface SiteStats {
  listings: number
  agents: number
  cities: number
  /** Sum of asking prices of active sale listings, PKR. */
  saleValue: number
  /** Distinct visitor sessions in the last 30 days. */
  monthlyVisitors: number
}

const REAL_LISTING = {
  OR: [{ listingSource: null }, { listingSource: { not: 'SHOWCASE' } }],
}

async function compute(): Promise<SiteStats> {
  const since = new Date(Date.now() - 30 * 86400000)
  const [listings, agents, value, sessions] = await Promise.all([
    prisma.property.count({ where: { status: 'ACTIVE', ...REAL_LISTING } }),
    prisma.agent.count({ where: { properties: { none: { listingSource: 'SHOWCASE' } } } }),
    prisma.property.aggregate({
      _sum: { price: true },
      where: { status: 'ACTIVE', listingType: 'FOR_SALE', ...REAL_LISTING },
    }),
    prisma.pageView.groupBy({ by: ['sessionId'], where: { createdAt: { gte: since } } }),
  ])
  return {
    listings,
    agents,
    cities: CITIES.length,
    saleValue: value._sum.price ?? 0,
    monthlyVisitors: sessions.length,
  }
}

/** Cached for 15 minutes; one set of queries serves every visitor. */
export const getSiteStats = unstable_cache(compute, ['site-stats'], { revalidate: 900 })

/** 1234 -> "1,234". */
export function formatCount(n: number): string {
  return n.toLocaleString('en-PK')
}

/** PKR in the units Pakistani buyers use: Lakh, Crore, Arab. */
export function formatPkrShort(n: number): string {
  const fmt = (v: number) => (v >= 100 ? Math.round(v).toLocaleString('en-PK') : v.toFixed(1).replace(/\.0$/, ''))
  if (n >= 1e9) return `PKR ${fmt(n / 1e9)} Arab`
  if (n >= 1e7) return `PKR ${fmt(n / 1e7)} Crore`
  if (n >= 1e5) return `PKR ${fmt(n / 1e5)} Lakh`
  return `PKR ${formatCount(Math.round(n))}`
}
