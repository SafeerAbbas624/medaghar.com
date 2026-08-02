import type { GuideCategory } from '@/content/guides/types'

/** Cover image for each guide article (local files in /public/images/guides). */
const GUIDE_COVERS: Record<string, string> = {
  'first-time-home-buyer-guide-pakistan': '/images/guides/first-time-home-buyer-guide-pakistan.jpg',
  'how-to-verify-property-documents': '/images/guides/how-to-verify-property-documents.jpg',
  'marla-kanal-explained': '/images/guides/marla-kanal-explained.jpg',
  'property-transfer-procedure-pakistan': '/images/guides/property-transfer-procedure-pakistan.jpg',
  'property-taxes-pakistan': '/images/guides/property-taxes-pakistan.jpg',
  'home-loan-pakistan-guide': '/images/guides/home-loan-pakistan-guide.jpg',
  'construction-cost-per-marla': '/images/guides/construction-cost-per-marla.jpg',
  'best-areas-to-invest-lahore': '/images/guides/best-areas-to-invest-lahore.jpg',
  'best-areas-to-invest-karachi': '/images/guides/best-areas-to-invest-karachi.jpg',
  'best-sectors-to-invest-islamabad': '/images/guides/best-sectors-to-invest-islamabad.jpg',
  'bahria-town-vs-dha': '/images/guides/bahria-town-vs-dha.jpg',
  'plot-file-vs-possession': '/images/guides/plot-file-vs-possession.jpg',
  'real-estate-scams-pakistan': '/images/guides/real-estate-scams-pakistan.jpg',
  'overseas-pakistani-property-guide': '/images/guides/overseas-pakistani-property-guide.jpg',
  'tenant-rights-rent-agreement-pakistan': '/images/guides/tenant-rights-rent-agreement-pakistan.jpg',
  'how-to-sell-property-fast-pakistan': '/images/guides/how-to-sell-property-fast-pakistan.jpg',
}

const CATEGORY_FALLBACKS: Record<GuideCategory, string> = {
  Buying: '/images/guides/default-buying.jpg',
  Selling: '/images/guides/how-to-sell-property-fast-pakistan.jpg',
  Renting: '/images/guides/tenant-rights-rent-agreement-pakistan.jpg',
  Investment: '/images/guides/default-investment.jpg',
  'Legal & Taxes': '/images/guides/how-to-verify-property-documents.jpg',
  Construction: '/images/guides/construction-cost-per-marla.jpg',
  'Home Financing': '/images/guides/home-loan-pakistan-guide.jpg',
}

export function getGuideCover(slug: string, category: GuideCategory): string {
  return GUIDE_COVERS[slug] || CATEGORY_FALLBACKS[category] || '/images/guides/default-buying.jpg'
}

/** Hero image per city page (cycled set in /public/images/cities). */
const CITY_IMAGES: Record<string, string> = {
  lahore: '/images/cities/city-homes-1.jpg',
  karachi: '/images/cities/city-skyline-1.jpg',
  islamabad: '/images/cities/city-skyline-2.jpg',
  rawalpindi: '/images/cities/city-homes-2.jpg',
  faisalabad: '/images/cities/city-homes-3.jpg',
  multan: '/images/cities/city-villa.jpg',
  peshawar: '/images/cities/city-homes-2.jpg',
  gujranwala: '/images/cities/city-homes-1.jpg',
  sialkot: '/images/cities/city-homes-3.jpg',
  hyderabad: '/images/cities/city-skyline-1.jpg',
  quetta: '/images/cities/city-homes-2.jpg',
  bahawalpur: '/images/cities/city-villa.jpg',
}

export function getCityImage(slug: string): string {
  return CITY_IMAGES[slug] || '/images/cities/city-homes-1.jpg'
}
