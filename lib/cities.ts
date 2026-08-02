/**
 * Data that powers the programmatic SEO landing pages:
 *   /[city]                       — city hub
 *   /[city]/[category]            — e.g. /lahore/houses-for-sale
 *   /[city]/area/[area]           — e.g. /lahore/area/dha-defence
 */

export interface CityArea {
  slug: string
  name: string
}

export interface City {
  slug: string
  name: string
  province: string
  /** Unique intro paragraph for the city hub page (SEO copy). */
  intro: string
  /** Short market-flavour line reused on category pages. */
  marketNote: string
  areas: CityArea[]
}

export interface SeoCategory {
  slug: string
  /** e.g. "Houses for Sale" */
  label: string
  listingType: 'FOR_SALE' | 'FOR_RENT'
  /** Prisma PropertyType values to match; empty = all types */
  propertyTypes: string[]
  /** Query string for the /properties search page */
  searchQuery: string
  intro: string
}

export const SEO_CATEGORIES: SeoCategory[] = [
  {
    slug: 'houses-for-sale',
    label: 'Houses for Sale',
    listingType: 'FOR_SALE',
    propertyTypes: ['HOUSE', 'FARM_HOUSE', 'PENTHOUSE'],
    searchQuery: 'listingType=FOR_SALE&type=HOUSE',
    intro:
      'Browse houses for sale including 3, 5, 7 and 10 marla homes as well as 1 and 2 kanal houses, listed directly by owners and verified agents.',
  },
  {
    slug: 'houses-for-rent',
    label: 'Houses for Rent',
    listingType: 'FOR_RENT',
    propertyTypes: ['HOUSE', 'UPPER_PORTION', 'LOWER_PORTION', 'FARM_HOUSE'],
    searchQuery: 'listingType=FOR_RENT&type=HOUSE',
    intro:
      'Find full houses and upper/lower portions for rent, with monthly rents, photos and direct owner contact details.',
  },
  {
    slug: 'flats-for-sale',
    label: 'Flats & Apartments for Sale',
    listingType: 'FOR_SALE',
    propertyTypes: ['FLAT', 'PENTHOUSE', 'ROOM'],
    searchQuery: 'listingType=FOR_SALE&type=FLAT',
    intro:
      'Compare flats and apartments for sale, from studio apartments to luxury penthouses, in high-rise and low-rise projects.',
  },
  {
    slug: 'flats-for-rent',
    label: 'Flats & Apartments for Rent',
    listingType: 'FOR_RENT',
    propertyTypes: ['FLAT', 'PENTHOUSE', 'ROOM'],
    searchQuery: 'listingType=FOR_RENT&type=FLAT',
    intro:
      'Rent flats and apartments with verified photos, family and bachelor options, and rents to suit every budget.',
  },
  {
    slug: 'plots-for-sale',
    label: 'Plots for Sale',
    listingType: 'FOR_SALE',
    propertyTypes: ['RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT', 'AGRICULTURAL_LAND', 'INDUSTRIAL_LAND', 'PLOT_FILE', 'PLOT_FORM'],
    searchQuery: 'listingType=FOR_SALE&type=RESIDENTIAL_PLOT',
    intro:
      'Residential and commercial plots for sale, including 3, 5 and 10 marla and 1 kanal plots, plot files and possession plots.',
  },
  {
    slug: 'commercial-for-sale',
    label: 'Commercial Property for Sale',
    listingType: 'FOR_SALE',
    propertyTypes: ['OFFICE', 'SHOP', 'WAREHOUSE', 'FACTORY', 'BUILDING'],
    searchQuery: 'listingType=FOR_SALE&type=OFFICE',
    intro:
      'Shops, offices, buildings and warehouses for sale in prime commercial markets and business districts.',
  },
  {
    slug: 'commercial-for-rent',
    label: 'Commercial Property for Rent',
    listingType: 'FOR_RENT',
    propertyTypes: ['OFFICE', 'SHOP', 'WAREHOUSE', 'FACTORY', 'BUILDING'],
    searchQuery: 'listingType=FOR_RENT&type=OFFICE',
    intro:
      'Rent shops, offices and commercial space for your business, with options in established markets and new commercial hubs.',
  },
]

export const CITIES: City[] = [
  {
    slug: 'lahore',
    name: 'Lahore',
    province: 'Punjab',
    intro:
      'Lahore is Pakistan’s second-largest property market and the heart of Punjab’s real estate activity. From established societies like DHA and Model Town to fast-developing corridors along Raiwind Road and the Ring Road, the city offers everything from 3 marla starter homes to 2 kanal luxury houses, high-rise apartments in Gulberg, and investment plots in LDA-approved schemes.',
    marketNote:
      'Lahore prices are typically quoted per marla, with DHA, Bahria Town and Gulberg commanding premium rates while Johar Town, Wapda Town and LDA Avenue offer mid-range options.',
    areas: [
      { slug: 'dha-defence', name: 'DHA Defence' },
      { slug: 'bahria-town', name: 'Bahria Town' },
      { slug: 'gulberg', name: 'Gulberg' },
      { slug: 'johar-town', name: 'Johar Town' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'wapda-town', name: 'Wapda Town' },
      { slug: 'lake-city', name: 'Lake City' },
      { slug: 'lda-avenue', name: 'LDA Avenue' },
      { slug: 'askari', name: 'Askari' },
      { slug: 'cantt', name: 'Lahore Cantt' },
      { slug: 'allama-iqbal-town', name: 'Allama Iqbal Town' },
      { slug: 'raiwind-road', name: 'Raiwind Road' },
    ],
  },
  {
    slug: 'karachi',
    name: 'Karachi',
    province: 'Sindh',
    intro:
      'Karachi is Pakistan’s largest city and its most diverse property market. Plots and houses here are measured in square yards (gaz), with 120 and 240 square yard homes forming the backbone of the market. From sea-facing apartments in Clifton and DHA to affordable schemes in Scheme 33 and North Karachi, the city serves every budget and investment strategy.',
    marketNote:
      'Karachi properties are quoted in square yards rather than marlas, and apartment living is more common here than in any other Pakistani city.',
    areas: [
      { slug: 'dha-defence', name: 'DHA Defence' },
      { slug: 'clifton', name: 'Clifton' },
      { slug: 'bahria-town', name: 'Bahria Town Karachi' },
      { slug: 'gulshan-e-iqbal', name: 'Gulshan-e-Iqbal' },
      { slug: 'gulistan-e-jauhar', name: 'Gulistan-e-Jauhar' },
      { slug: 'north-nazimabad', name: 'North Nazimabad' },
      { slug: 'scheme-33', name: 'Scheme 33' },
      { slug: 'malir', name: 'Malir' },
      { slug: 'pechs', name: 'PECHS' },
      { slug: 'federal-b-area', name: 'Federal B Area' },
      { slug: 'north-karachi', name: 'North Karachi' },
      { slug: 'dha-city', name: 'DHA City (M9)' },
    ],
  },
  {
    slug: 'islamabad',
    name: 'Islamabad',
    province: 'Islamabad Capital Territory',
    intro:
      'Islamabad combines planned CDA sectors with rapidly growing private societies along the new airport corridor. The capital’s property market is known for clean titles in CDA sectors like G-13 and D-12, premium living in E-7 and F-sectors, and high-growth investment options in DHA, Bahria Town, Gulberg and B-17. Demand is supported by government employment, diplomatic presence and overseas Pakistani investment.',
    marketNote:
      'CDA-sector plots carry the strongest titles in the country, while private societies on the airport corridor offer lower entry prices with higher risk and reward.',
    areas: [
      { slug: 'dha', name: 'DHA Islamabad' },
      { slug: 'bahria-town', name: 'Bahria Town' },
      { slug: 'g-13', name: 'G-13' },
      { slug: 'g-14', name: 'G-14' },
      { slug: 'd-12', name: 'D-12' },
      { slug: 'e-11', name: 'E-11' },
      { slug: 'b-17', name: 'B-17' },
      { slug: 'gulberg-greens', name: 'Gulberg Greens' },
      { slug: 'pwd', name: 'PWD Housing Society' },
      { slug: 'soan-garden', name: 'Soan Garden' },
      { slug: 'f-sectors', name: 'F Sectors' },
      { slug: 'i-sectors', name: 'I Sectors' },
    ],
  },
  {
    slug: 'rawalpindi',
    name: 'Rawalpindi',
    province: 'Punjab',
    intro:
      'Rawalpindi’s property market moves together with Islamabad’s but at friendlier prices. Bahria Town’s original phases, DHA Phases 1–5, and established areas like Satellite Town and Chaklala anchor the market, while Adiala Road and Rawat offer affordable plots for first-time buyers. The city’s position on the GT Road and proximity to the twin-city job market keep rental demand strong.',
    marketNote:
      'Rawalpindi offers twin-city access at a discount to Islamabad, with Bahria Town and DHA leading premium demand and Adiala Road serving budget buyers.',
    areas: [
      { slug: 'bahria-town', name: 'Bahria Town' },
      { slug: 'dha', name: 'DHA Islamabad-Rawalpindi' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'chaklala-scheme', name: 'Chaklala Scheme' },
      { slug: 'adiala-road', name: 'Adiala Road' },
      { slug: 'airport-housing-society', name: 'Airport Housing Society' },
      { slug: 'gulraiz', name: 'Gulraiz Housing Scheme' },
      { slug: 'westridge', name: 'Westridge' },
      { slug: 'peshawar-road', name: 'Peshawar Road' },
      { slug: 'rawat', name: 'Rawat' },
    ],
  },
  {
    slug: 'faisalabad',
    name: 'Faisalabad',
    province: 'Punjab',
    intro:
      'Faisalabad, Pakistan’s textile capital, has a property market driven by industrial wealth and a growing middle class. Established colonies like People’s Colony and Madina Town sit alongside newer gated options such as Eden Valley and Citi Housing. Commercial property around the eight bazaars of the Clock Tower and on Susan Road remains some of the most productive retail real estate in Punjab.',
    marketNote:
      'Faisalabad combines strong commercial yields around its industrial economy with affordable residential prices compared to Lahore.',
    areas: [
      { slug: 'madina-town', name: 'Madina Town' },
      { slug: 'peoples-colony', name: 'People’s Colony' },
      { slug: 'eden-valley', name: 'Eden Valley' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'susan-road', name: 'Susan Road' },
      { slug: 'satiana-road', name: 'Satiana Road' },
      { slug: 'jaranwala-road', name: 'Jaranwala Road' },
      { slug: 'canal-road', name: 'Canal Road' },
    ],
  },
  {
    slug: 'multan',
    name: 'Multan',
    province: 'Punjab',
    intro:
      'Multan is southern Punjab’s commercial hub and its property market has accelerated since the M4/M5 motorways cut travel times to Lahore and Karachi. DHA Multan and Citi Housing brought modern gated living to the city, while established areas like Gulgasht Colony and Shah Rukn-e-Alam serve families seeking schools and amenities. Agricultural land on the city’s fringes remains a traditional store of wealth.',
    marketNote:
      'DHA Multan’s development has lifted the whole market, and prices remain well below Lahore for comparable plot sizes.',
    areas: [
      { slug: 'dha', name: 'DHA Multan' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'gulgasht-colony', name: 'Gulgasht Colony' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'shah-rukn-e-alam', name: 'Shah Rukn-e-Alam Colony' },
      { slug: 'bosan-road', name: 'Bosan Road' },
      { slug: 'wapda-town', name: 'Wapda Town' },
      { slug: 'northern-bypass', name: 'Northern Bypass' },
    ],
  },
  {
    slug: 'peshawar',
    name: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    intro:
      'Peshawar anchors Khyber Pakhtunkhwa’s property market, where traditional big-marla measurements and strong family-compound culture shape demand. Hayatabad remains the city’s premier planned township, DHA Peshawar is bringing new investment-grade inventory, and Regi Model Town and Warsak Road provide mid-market options. University Road’s commercial strip is the province’s busiest business address.',
    marketNote:
      'Note that Peshawar commonly uses the traditional 272.25 sq ft marla, so always confirm plot dimensions when comparing per-marla rates.',
    areas: [
      { slug: 'hayatabad', name: 'Hayatabad' },
      { slug: 'dha', name: 'DHA Peshawar' },
      { slug: 'regi-model-town', name: 'Regi Model Town' },
      { slug: 'university-road', name: 'University Road' },
      { slug: 'warsak-road', name: 'Warsak Road' },
      { slug: 'ring-road', name: 'Ring Road' },
      { slug: 'gulbahar', name: 'Gulbahar' },
      { slug: 'faqirabad', name: 'Faqirabad' },
    ],
  },
  {
    slug: 'gujranwala',
    name: 'Gujranwala',
    province: 'Punjab',
    intro:
      'Gujranwala’s property market is powered by one of Pakistan’s strongest industrial economies. The city’s manufacturers and exporters invest heavily in local real estate, supporting premium gated communities like DC Colony and Citi Housing alongside dense, high-yield commercial property on GT Road. Wapda Town and Model Town serve the city’s growing professional class.',
    marketNote:
      'Industrial wealth keeps Gujranwala’s demand resilient, and GT Road commercial property is among the best-yielding in central Punjab.',
    areas: [
      { slug: 'dc-colony', name: 'DC Colony' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'wapda-town', name: 'Wapda Town' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'gt-road', name: 'GT Road' },
      { slug: 'master-city', name: 'Master City' },
    ],
  },
  {
    slug: 'sialkot',
    name: 'Sialkot',
    province: 'Punjab',
    intro:
      'Sialkot punches far above its size in property terms thanks to its export economy in surgical instruments, sports goods and leather. The city’s business families drive demand for quality housing in Cantt and Model Town, while the Sialkot International Airport corridor and Daska Road host newer societies. Commercial property near Paris Road and Kashmir Road stays tightly held.',
    marketNote:
      'Export income and overseas Sialkotis underpin steady demand, with Cantt addresses commanding the city’s strongest premiums.',
    areas: [
      { slug: 'cantt', name: 'Sialkot Cantt' },
      { slug: 'model-town', name: 'Model Town' },
      { slug: 'citi-housing', name: 'Citi Housing' },
      { slug: 'daska-road', name: 'Daska Road' },
      { slug: 'wazirabad-road', name: 'Wazirabad Road' },
      { slug: 'airport-road', name: 'Airport Road' },
    ],
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    province: 'Sindh',
    intro:
      'Hyderabad is Sindh’s second city and a natural overflow market for Karachi investment. Qasimabad’s schemes and Latifabad’s established units form the residential core, while the M9 motorway has pulled new societies toward the Karachi corridor. Like Karachi, plots here are measured in square yards, and the city offers some of the most affordable urban property in Pakistan’s major cities.',
    marketNote:
      'Hyderabad offers Karachi-corridor growth at entry prices well below the metropolis, with Qasimabad leading new development.',
    areas: [
      { slug: 'qasimabad', name: 'Qasimabad' },
      { slug: 'latifabad', name: 'Latifabad' },
      { slug: 'auto-bhan-road', name: 'Auto Bhan Road' },
      { slug: 'hirabad', name: 'Hirabad' },
      { slug: 'citizen-colony', name: 'Citizen Colony' },
      { slug: 'wadhu-wah', name: 'Wadhu Wah Road' },
    ],
  },
  {
    slug: 'quetta',
    name: 'Quetta',
    province: 'Balochistan',
    intro:
      'Quetta is Balochistan’s capital and its only large urban property market. Demand concentrates in established localities like Jinnah Town, Samungli Road and Chiltan Housing Scheme, with strong preference for owned houses over apartments. Land on the airport and Sariab corridors trades actively, and the city’s role as a trade gateway supports its commercial market on Zarghoon Road.',
    marketNote:
      'Quetta’s market favours houses and plots over flats, with Jinnah Town and Samungli Road the most sought-after addresses.',
    areas: [
      { slug: 'jinnah-town', name: 'Jinnah Town' },
      { slug: 'samungli-road', name: 'Samungli Road' },
      { slug: 'chiltan-housing', name: 'Chiltan Housing Scheme' },
      { slug: 'airport-road', name: 'Airport Road' },
      { slug: 'zarghoon-road', name: 'Zarghoon Road' },
      { slug: 'sariab-road', name: 'Sariab Road' },
    ],
  },
  {
    slug: 'bahawalpur',
    name: 'Bahawalpur',
    province: 'Punjab',
    intro:
      'Bahawalpur combines princely-state heritage with a steadily modernising property market. DHA Bahawalpur has brought defence-authority development standards to southern Punjab, while Model Town A and B and Satellite Town remain the established family choices. The city’s agricultural hinterland and university population support both land investment and rental demand.',
    marketNote:
      'DHA’s arrival re-rated Bahawalpur’s market, yet prices remain among the most affordable of any DHA city.',
    areas: [
      { slug: 'dha', name: 'DHA Bahawalpur' },
      { slug: 'model-town-a', name: 'Model Town A' },
      { slug: 'model-town-b', name: 'Model Town B' },
      { slug: 'satellite-town', name: 'Satellite Town' },
      { slug: 'cheema-town', name: 'Cheema Town' },
      { slug: 'yazman-road', name: 'Yazman Road' },
    ],
  },
]

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug.toLowerCase())
}

export function getCategory(slug: string): SeoCategory | undefined {
  return SEO_CATEGORIES.find((c) => c.slug === slug.toLowerCase())
}

export function getArea(city: City, areaSlug: string): CityArea | undefined {
  return city.areas.find((a) => a.slug === areaSlug.toLowerCase())
}
