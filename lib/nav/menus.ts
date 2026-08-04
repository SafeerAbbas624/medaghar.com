/**
 * Navigation menu structure.
 *
 * Kept as plain data separate from the Navbar so the desktop mega-menu and
 * the mobile accordion render the same links from one source.
 *
 * Every href points at a canonical tree URL, never a legacy page that would
 * 301 — navigation should not route a visitor through a redirect. City lists
 * are hardcoded rather than imported from content/locations, which carries
 * long prose per city and would add tens of KB to the client bundle.
 */

export interface MenuLink {
  href: string
  label: string
}

export interface MenuColumn {
  heading: string
  links: MenuLink[]
  /** Link at the foot of the column, e.g. "All cities". */
  footer?: MenuLink
}

export interface MegaMenu {
  /** Trigger label in the navbar. */
  label: string
  /** Where the trigger itself goes when clicked/tapped. */
  href: string
  columns: MenuColumn[]
  /** Promoted panel on the right-hand side. */
  feature?: {
    title: string
    body: string
    cta: MenuLink
  }
}

const TOP_CITIES: { slug: string; name: string }[] = [
  { slug: 'lahore', name: 'Lahore' },
  { slug: 'karachi', name: 'Karachi' },
  { slug: 'islamabad', name: 'Islamabad' },
  { slug: 'rawalpindi', name: 'Rawalpindi' },
  { slug: 'faisalabad', name: 'Faisalabad' },
  { slug: 'multan', name: 'Multan' },
  { slug: 'peshawar', name: 'Peshawar' },
  { slug: 'gujranwala', name: 'Gujranwala' },
]

function cityLinks(purpose: 'for-sale' | 'for-rent', typeSlug = 'property'): MenuLink[] {
  return TOP_CITIES.map((c) => ({
    href: `/${purpose}/${typeSlug}/${c.slug}`,
    label: c.name,
  }))
}

export const BUY_MENU: MegaMenu = {
  label: 'Buy',
  href: '/residential-for-sale',
  columns: [
    {
      heading: 'Property Type',
      links: [
        { href: '/for-sale/house', label: 'Houses' },
        { href: '/for-sale/flat', label: 'Flats & Apartments' },
        { href: '/for-sale/upper-portion', label: 'Upper Portions' },
        { href: '/for-sale/lower-portion', label: 'Lower Portions' },
        { href: '/for-sale/farm-house', label: 'Farm Houses' },
        { href: '/for-sale/penthouse', label: 'Penthouses' },
      ],
      footer: { href: '/residential-for-sale', label: 'All residential for sale' },
    },
    {
      heading: 'Popular Cities',
      links: cityLinks('for-sale'),
    },
    {
      heading: 'By Budget',
      links: [
        { href: '/residential-for-sale?maxPrice=5000000', label: 'Under 50 Lakh' },
        { href: '/residential-for-sale?minPrice=5000000&maxPrice=10000000', label: '50 Lakh – 1 Crore' },
        { href: '/residential-for-sale?minPrice=10000000&maxPrice=20000000', label: '1 – 2 Crore' },
        { href: '/residential-for-sale?minPrice=20000000&maxPrice=50000000', label: '2 – 5 Crore' },
        { href: '/residential-for-sale?minPrice=50000000', label: 'Above 5 Crore' },
      ],
    },
  ],
  feature: {
    title: 'Buy direct from the owner',
    body: 'No agent, no commission on either side. Deal with the person who owns the property.',
    cta: { href: '/owner', label: 'Browse owner listings' },
  },
}

export const RENT_MENU: MegaMenu = {
  label: 'Rent',
  href: '/residential-for-rent',
  columns: [
    {
      heading: 'Property Type',
      links: [
        { href: '/for-rent/house', label: 'Houses' },
        { href: '/for-rent/flat', label: 'Flats & Apartments' },
        { href: '/for-rent/upper-portion', label: 'Upper Portions' },
        { href: '/for-rent/lower-portion', label: 'Lower Portions' },
        { href: '/for-rent/room', label: 'Rooms' },
        { href: '/for-rent/guest-house', label: 'Guest Houses' },
      ],
      footer: { href: '/residential-for-rent', label: 'All residential for rent' },
    },
    {
      heading: 'Popular Cities',
      links: cityLinks('for-rent'),
    },
    {
      heading: 'By Monthly Rent',
      links: [
        { href: '/residential-for-rent?maxPrice=25000', label: 'Under 25,000' },
        { href: '/residential-for-rent?minPrice=25000&maxPrice=50000', label: '25,000 – 50,000' },
        { href: '/residential-for-rent?minPrice=50000&maxPrice=100000', label: '50,000 – 1 Lakh' },
        { href: '/residential-for-rent?minPrice=100000&maxPrice=200000', label: '1 – 2 Lakh' },
        { href: '/residential-for-rent?minPrice=200000', label: 'Above 2 Lakh' },
      ],
    },
  ],
  feature: {
    title: 'Renting out your property?',
    body: 'Post it free and deal with tenants directly. Two active rental listings on a personal account.',
    cta: { href: '/sell', label: 'List your property free' },
  },
}

export const PLOTS_MENU: MegaMenu = {
  label: 'Plots',
  href: '/for-sale/plot',
  columns: [
    {
      heading: 'Plot Type',
      links: [
        { href: '/for-sale/plot', label: 'Residential Plots' },
        { href: '/for-sale/commercial-plot', label: 'Commercial Plots' },
        { href: '/for-sale/agricultural-land', label: 'Agricultural Land' },
        { href: '/for-sale/industrial-land', label: 'Industrial Land' },
      ],
    },
    {
      heading: 'Popular Cities',
      links: cityLinks('for-sale', 'plot'),
    },
    {
      heading: 'Tools',
      links: [
        { href: '/tools/area-converter', label: 'Marla / Kanal Converter' },
        { href: '/tools/construction-cost-calculator', label: 'Construction Cost' },
        { href: '/tools/property-tax-calculator', label: 'Property Tax' },
        { href: '/tools/mortgage-calculator', label: 'Mortgage Calculator' },
        { href: '/tools/rental-yield-calculator', label: 'Rental Yield' },
      ],
    },
  ],
  feature: {
    title: 'Buying a plot?',
    body: 'Check the document type, the approving authority and the NOC before you pay a token amount.',
    cta: { href: '/guides', label: 'Read the buyer guides' },
  },
}

export const MEGA_MENUS: MegaMenu[] = [BUY_MENU, RENT_MENU, PLOTS_MENU]

/** Plain links that need no dropdown. */
export const SIMPLE_LINKS: MenuLink[] = [
  { href: '/sell', label: 'Sell' },
  { href: '/owner', label: 'By Owner' },
  { href: '/agents', label: 'Agents' },
  { href: '/guides', label: 'Guides' },
]

export const MORE_LINKS: MenuLink[] = [
  { href: '/commercial-for-sale', label: 'Commercial for Sale' },
  { href: '/commercial-for-rent', label: 'Commercial for Rent' },
  { href: '/tools', label: 'Property Tools' },
  { href: '/market-insights', label: 'Market Insights' },
  { href: '/home-loans', label: 'Home Loans' },
  { href: '/pricing', label: 'Pricing & Featured' },
]
