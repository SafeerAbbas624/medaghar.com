/**
 * Showcase seeder — full-detail demo listings across every URL-reachable
 * property type, both purposes, and enough depth to clear the indexability
 * gates (city >= 1, area >= 3, subarea >= 5).
 *
 * Every optional field is populated so the UI can be reviewed end to end:
 * estimates, neighbourhood scores, nearby places, price history, images,
 * features, possession/furnishing/facing, tax, maintenance, MLS, views.
 *
 *   npx tsx prisma/seed-showcase.ts          # add showcase listings
 *   npx tsx prisma/seed-showcase.ts --clean  # remove them again
 *
 * Everything it creates is tagged with mlsSource = 'SHOWCASE', so --clean
 * removes exactly these rows and nothing else.
 */

import { PrismaClient, PropertyType, ListingType, PropertyStatus } from '@prisma/client'
import { resolveLocation } from '../lib/locations'
import { buildListingSlug } from '../lib/listingSlug'

const prisma = new PrismaClient()
const TAG = 'SHOWCASE'

// --- image pools by category ------------------------------------------------
const IMG = {
  house: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
  ],
  flat: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  ],
  plot: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
  ],
  office: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
  ],
  shop: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80',
  ],
  industrial: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
  ],
  farm: [
    'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&q=80',
    'https://images.unsplash.com/photo-1595877244574-e90ce41ce089?w=1200&q=80',
  ],
  room: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80',
  ],
}

function imagesFor(type: PropertyType): string[] {
  if (['HOUSE', 'UPPER_PORTION', 'LOWER_PORTION', 'BASEMENT'].includes(type)) return IMG.house
  if (['FLAT', 'PENTHOUSE', 'HOTEL_SUITES'].includes(type)) return IMG.flat
  if (['RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT', 'PLOT_FILE', 'PLOT_FORM', 'AGRICULTURAL_LAND', 'INDUSTRIAL_LAND'].includes(type)) return IMG.plot
  if (['OFFICE', 'BUILDING'].includes(type)) return IMG.office
  if (type === 'SHOP') return IMG.shop
  if (['WAREHOUSE', 'FACTORY'].includes(type)) return IMG.industrial
  if (['FARM_HOUSE', 'GUEST_HOUSE'].includes(type)) return IMG.farm
  return IMG.room
}

const FEATURES: Record<string, string[]> = {
  residential: ['Marble Flooring', 'Imported Kitchen Fittings', 'Servant Quarter', 'Landscaped Lawn', 'Covered Parking', '24/7 Security', 'Standby Generator', 'Water Filtration Plant', 'Central Heating', 'Solar Panels'],
  flat: ['Lift / Elevator', 'Standby Generator', 'Covered Parking', '24/7 Security', 'Community Gym', 'Rooftop Terrace', 'Intercom', 'Maintenance Staff'],
  plot: ['Corner Plot', 'Main Boulevard Facing', 'All Utilities Available', 'Clear Title', 'Possession Available', 'Developed Sector', 'Park Facing'],
  commercial: ['Prime Location', 'High Foot Traffic', 'Central Air Conditioning', 'Dedicated Parking', 'Standby Generator', 'Fire Safety System', 'High-Speed Fibre Internet', 'Loading Bay'],
}

function featuresFor(type: PropertyType): string {
  let pool = FEATURES.residential
  if (['FLAT', 'PENTHOUSE', 'ROOM', 'HOSTEL'].includes(type)) pool = FEATURES.flat
  else if (['RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT', 'PLOT_FILE', 'PLOT_FORM', 'AGRICULTURAL_LAND', 'INDUSTRIAL_LAND'].includes(type)) pool = FEATURES.plot
  else if (['OFFICE', 'SHOP', 'WAREHOUSE', 'FACTORY', 'BUILDING'].includes(type)) pool = FEATURES.commercial
  return JSON.stringify(pool.slice(0, 5 + Math.floor(Math.random() * 3)))
}

function nearbyFor(city: string): string {
  const byCity: Record<string, [string, string, string][]> = {
    Lahore: [
      ['Emporium Mall', '3 km', 'Shopping'],
      ['Shaukat Khanum Hospital', '5 km', 'Hospital'],
      ['Beaconhouse School System', '1.2 km', 'School'],
      ['Lahore Ring Road', '2 km', 'Transport'],
    ],
    Karachi: [
      ['Dolmen Mall Clifton', '4 km', 'Shopping'],
      ['Aga Khan University Hospital', '6 km', 'Hospital'],
      ['The City School', '1.5 km', 'School'],
      ['Shahrah-e-Faisal', '3 km', 'Transport'],
    ],
    Islamabad: [
      ['Centaurus Mall', '5 km', 'Shopping'],
      ['Shifa International Hospital', '4 km', 'Hospital'],
      ['Roots Millennium School', '2 km', 'School'],
      ['Islamabad Expressway', '3 km', 'Transport'],
    ],
  }
  const list = byCity[city] ?? [
    ['Main Bazaar', '2 km', 'Shopping'],
    ['District Hospital', '3 km', 'Hospital'],
    ['Government High School', '1 km', 'School'],
  ]
  return JSON.stringify(list.map(([name, distance, type]) => ({ name, distance, type })))
}

const POSSESSION = ['Ready', 'Under Construction', 'Ready']
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished']
const FACING = ['North', 'South', 'East', 'West', 'North-East', 'South-West']
const CRIME = ['Low', 'Low', 'Medium']

interface Spec {
  type: PropertyType
  listing: ListingType
  city: string
  area: string
  subArea?: string
  title: string
  price: number
  beds: number
  baths: number
  marla?: number
  kanal?: number
  sqft?: number
  desc: string
  fsbo?: boolean
  featured?: boolean
  status?: PropertyStatus
}

/** ~4 per type so area pages (>=3) and some subarea pages (>=5) clear the gate. */
const SPECS: Spec[] = [
  // ---- HOUSE (Lahore DHA Phase 6 gets 5 to clear the subarea gate) ---------
  { type: 'HOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 6', title: '1 Kanal Modern House in DHA Phase 6', price: 92500000, beds: 5, baths: 6, kanal: 1, sqft: 5400, desc: 'A brand-new 1 kanal house on a quiet street in DHA Phase 6. Italian marble throughout the ground floor, imported kitchen fittings, a separate servant block and a landscaped back lawn. Two-car covered porch with an additional open space for guests.', featured: true },
  { type: 'HOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 6', title: '10 Marla House with Basement in DHA Phase 6', price: 58000000, beds: 4, baths: 5, marla: 10, sqft: 3200, desc: 'Well-maintained 10 marla house with a fully finished basement currently used as a home cinema. Wooden flooring in all bedrooms, solar panels on the roof and a bore water connection.' },
  { type: 'HOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 6', title: '5 Marla House Near Jamia Mosque, DHA Phase 6', price: 31500000, beds: 3, baths: 4, marla: 5, sqft: 1900, desc: 'Compact and efficient 5 marla house within walking distance of the Phase 6 Jamia Mosque and commercial market. Ideal for a small family or as a rental investment.', fsbo: true },
  { type: 'HOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 6', title: '2 Kanal Corner House in DHA Phase 6', price: 185000000, beds: 6, baths: 7, kanal: 2, sqft: 8200, desc: 'A rare 2 kanal corner property with a swimming pool, separate guest annexe and eight-car parking. Double-height entrance lobby and a fully equipped outdoor kitchen for entertaining.', featured: true },
  { type: 'HOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 5', title: '1 Kanal House Facing Park, DHA Phase 5', price: 105000000, beds: 5, baths: 6, kanal: 1, sqft: 5600, desc: 'Park-facing 1 kanal house in the most established part of Phase 5. Mature garden, covered terrace and a separate drawing room with its own entrance.' },
  { type: 'HOUSE', listing: 'FOR_RENT', city: 'Lahore', area: 'Bahria Town', title: '10 Marla House for Rent in Bahria Town', price: 165000, beds: 4, baths: 4, marla: 10, sqft: 3100, desc: 'Available immediately: a well-kept 10 marla house in Bahria Town with split AC units in every room, a maintained lawn and 24/7 society security. Annual lease preferred.' },
  { type: 'HOUSE', listing: 'FOR_RENT', city: 'Karachi', area: 'DHA', subArea: 'Phase 6', title: '500 Sq Yd Bungalow for Rent in DHA Phase 6', price: 425000, beds: 5, baths: 6, sqft: 4500, desc: 'Spacious bungalow available for rent on a wide street in DHA Phase 6. Servant quarter, standby generator and a large front lawn. Suitable for a family or a corporate lease.', featured: true },

  // ---- FLAT ---------------------------------------------------------------
  { type: 'FLAT', listing: 'FOR_SALE', city: 'Karachi', area: 'Clifton', subArea: 'Block 2', title: '3 Bed Sea-Facing Apartment in Clifton Block 2', price: 68000000, beds: 3, baths: 4, sqft: 2600, desc: 'Uninterrupted Arabian Sea views from an eighth-floor apartment in a well-managed Clifton building. Imported kitchen, central air conditioning, two dedicated parking bays and a residents-only gym.', featured: true },
  { type: 'FLAT', listing: 'FOR_SALE', city: 'Karachi', area: 'Clifton', subArea: 'Block 2', title: '2 Bed Apartment in Clifton Block 2', price: 34500000, beds: 2, baths: 3, sqft: 1450, desc: 'Bright two-bedroom apartment with a large living area and a covered balcony. Building has a lift, backup generator and round-the-clock security.' },
  { type: 'FLAT', listing: 'FOR_SALE', city: 'Islamabad', area: 'F-11', subArea: 'F-11 Markaz', title: '2 Bed Apartment in F-11 Markaz', price: 29500000, beds: 2, baths: 2, sqft: 1250, desc: 'Centrally located apartment in F-11 Markaz, walking distance from restaurants and grocery stores. Recently repainted with new bathroom fittings.', fsbo: true },
  { type: 'FLAT', listing: 'FOR_RENT', city: 'Islamabad', area: 'E-11', title: '3 Bed Family Apartment for Rent in E-11', price: 145000, beds: 3, baths: 3, sqft: 1800, desc: 'Family apartment in a secure E-11 building with lift access, dedicated parking and a maintenance team on site. Water and society charges included in the rent.' },
  { type: 'FLAT', listing: 'FOR_RENT', city: 'Lahore', area: 'Gulberg', title: '2 Bed Serviced Apartment in Gulberg', price: 110000, beds: 2, baths: 2, sqft: 1100, desc: 'Fully furnished serviced apartment on Main Boulevard Gulberg. Housekeeping twice a week, high-speed fibre internet and a rooftop terrace shared between four units.' },

  // ---- PLOT (residential / file / form) ------------------------------------
  { type: 'RESIDENTIAL_PLOT', listing: 'FOR_SALE', city: 'Islamabad', area: 'Bahria Town', subArea: 'Phase 8', title: '1 Kanal Residential Plot in Bahria Town Phase 8', price: 42000000, beds: 0, baths: 0, kanal: 1, desc: 'Level 1 kanal plot on a 40-foot street in a developed pocket of Phase 8. All utilities laid, possession available immediately and the file is clear for transfer.', featured: true },
  { type: 'RESIDENTIAL_PLOT', listing: 'FOR_SALE', city: 'Islamabad', area: 'Bahria Town', subArea: 'Phase 8', title: '10 Marla Park-Facing Plot in Bahria Town Phase 8', price: 24500000, beds: 0, baths: 0, marla: 10, desc: 'Park-facing 10 marla plot in a quiet residential block. No overhead lines, ready for immediate construction.' },
  { type: 'RESIDENTIAL_PLOT', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 9 Prism', title: '1 Kanal Plot in DHA Phase 9 Prism', price: 38500000, beds: 0, baths: 0, kanal: 1, desc: 'Well-positioned 1 kanal plot in Block K of Phase 9 Prism, close to the main approach road. Development charges paid in full.' },
  { type: 'PLOT_FILE', listing: 'FOR_SALE', city: 'Lahore', area: 'Bahria Town', title: '10 Marla Plot File in Bahria Town Lahore', price: 8500000, beds: 0, baths: 0, marla: 10, desc: 'Transferable 10 marla plot file with all dues cleared to date. Suitable for investors waiting on balloting.', fsbo: true },
  { type: 'PLOT_FORM', listing: 'FOR_SALE', city: 'Rawalpindi', area: 'Bahria Town', subArea: 'Phase 8', title: '5 Marla Plot Form in Bahria Town Phase 8', price: 4200000, beds: 0, baths: 0, marla: 5, desc: 'Original 5 marla plot form, all instalments paid. Documentation ready for immediate transfer at the society office.' },

  // ---- UPPER / LOWER PORTION ----------------------------------------------
  { type: 'UPPER_PORTION', listing: 'FOR_RENT', city: 'Lahore', area: 'Johar Town', title: '3 Bed Upper Portion for Rent in Johar Town', price: 78000, beds: 3, baths: 3, marla: 10, sqft: 1600, desc: 'Separate-entrance upper portion with its own electricity and gas meters. Two balconies, a roof terrace for exclusive use, and space for one car.' },
  { type: 'UPPER_PORTION', listing: 'FOR_RENT', city: 'Karachi', area: 'Gulshan-e-Iqbal', subArea: 'Block 13', title: '2 Bed Upper Portion in Gulshan-e-Iqbal Block 13', price: 55000, beds: 2, baths: 2, sqft: 1050, desc: 'Well-ventilated upper portion in a quiet lane of Block 13. Separate stairs, water tank on the roof and a small terrace.' },
  { type: 'UPPER_PORTION', listing: 'FOR_RENT', city: 'Islamabad', area: 'G-11', title: 'Upper Portion for Rent in G-11', price: 95000, beds: 3, baths: 3, sqft: 1500, desc: 'Bright upper portion in G-11 with separate entrance, dedicated parking and independent utility meters. Close to the G-11 Markaz.' },
  { type: 'LOWER_PORTION', listing: 'FOR_RENT', city: 'Lahore', area: 'Model Town', title: '2 Bed Lower Portion for Rent in Model Town', price: 65000, beds: 2, baths: 2, marla: 10, sqft: 1400, desc: 'Ground-floor portion with a private lawn and separate gate. Suitable for a small family or a home office.' },
  { type: 'LOWER_PORTION', listing: 'FOR_RENT', city: 'Islamabad', area: 'F-10', title: '3 Bed Lower Portion in F-10', price: 130000, beds: 3, baths: 3, sqft: 1750, desc: 'Spacious lower portion in a sector house, with a lawn, servant room and covered parking for two cars.' },

  // ---- FARM HOUSE / PENTHOUSE / ROOM / GUEST HOUSE / HOSTEL ---------------
  { type: 'FARM_HOUSE', listing: 'FOR_SALE', city: 'Islamabad', area: 'Chak Shahzad', title: '4 Kanal Farm House in Chak Shahzad', price: 165000000, beds: 6, baths: 7, kanal: 4, sqft: 9000, desc: 'A mature 4 kanal farmhouse with fruit orchards, a swimming pool and a separate staff block. Margalla views from the upper terrace and a bore for irrigation.', featured: true },
  { type: 'FARM_HOUSE', listing: 'FOR_RENT', city: 'Lahore', area: 'Bedian Road', title: 'Farm House for Weekend Rental on Bedian Road', price: 85000, beds: 4, baths: 4, kanal: 2, sqft: 4000, desc: 'Available on nightly or weekly rental for events and family gatherings. Heated pool, barbecue area, generator backup and parking for fifteen cars.' },
  { type: 'PENTHOUSE', listing: 'FOR_SALE', city: 'Karachi', area: 'Clifton', subArea: 'Block 5', title: 'Duplex Penthouse in Clifton Block 5', price: 145000000, beds: 4, baths: 5, sqft: 5200, desc: 'Full-floor duplex penthouse with a private roof terrace and 360-degree views over Clifton and the sea. Private lift access, imported fittings and four parking bays.', featured: true },
  { type: 'PENTHOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'Gulberg', title: 'Penthouse on Main Boulevard Gulberg', price: 98000000, beds: 3, baths: 4, sqft: 3800, desc: 'Top-floor penthouse with a wraparound terrace overlooking Main Boulevard. Two covered parking bays and a dedicated service entrance.' },
  { type: 'ROOM', listing: 'FOR_RENT', city: 'Lahore', area: 'Johar Town', title: 'Furnished Room for Rent in Johar Town', price: 22000, beds: 1, baths: 1, sqft: 220, desc: 'Furnished single room with an attached bath, suitable for a working professional or student. Shared kitchen, Wi-Fi and electricity included in the rent.' },
  { type: 'ROOM', listing: 'FOR_RENT', city: 'Islamabad', area: 'G-9', title: 'Single Room with Attached Bath in G-9', price: 28000, beds: 1, baths: 1, sqft: 250, desc: 'Independent room with attached washroom in a family house. Separate entrance, ideal for a single tenant working in Blue Area.' },
  { type: 'GUEST_HOUSE', listing: 'FOR_RENT', city: 'Islamabad', area: 'F-7', title: '8 Room Guest House in F-7', price: 850000, beds: 8, baths: 9, kanal: 1, sqft: 6000, desc: 'Running guest house in a prime F-7 location, fully furnished with eight en-suite rooms, a commercial kitchen, dining hall and staff quarters. Handover with existing bookings possible.' },
  { type: 'GUEST_HOUSE', listing: 'FOR_SALE', city: 'Murree', area: 'Mall Road', title: 'Hill-View Guest House near Mall Road', price: 125000000, beds: 12, baths: 12, sqft: 7500, desc: 'Twelve-room guest house a short walk from Mall Road with valley views from every front-facing room. Established occupancy record through the summer season.' },
  { type: 'HOSTEL', listing: 'FOR_RENT', city: 'Lahore', area: 'Johar Town', title: 'Girls Hostel Building in Johar Town', price: 450000, beds: 20, baths: 12, sqft: 5500, desc: 'Purpose-run hostel building with twenty rooms, a common dining hall, study area, backup generator and a resident warden apartment. Close to universities on Canal Road.' },

  // ---- AGRICULTURAL LAND --------------------------------------------------
  { type: 'AGRICULTURAL_LAND', listing: 'FOR_SALE', city: 'Sheikhupura', area: 'Faisalabad Road', title: '25 Acre Agricultural Land on Faisalabad Road', price: 87500000, beds: 0, baths: 0, desc: 'Twenty-five acres of level, cultivable land with a tube well and canal water rights. Currently under wheat and fodder rotation. Metalled road access up to the boundary.' },
  { type: 'AGRICULTURAL_LAND', listing: 'FOR_SALE', city: 'Okara', area: 'Depalpur Road', title: '12 Acre Farmland near Depalpur Road', price: 42000000, beds: 0, baths: 0, desc: 'Productive twelve-acre holding with two tube wells and a farm shed. Suitable for dairy or continued crop farming. Clear title with an updated fard.', fsbo: true },

  // ---- COMMERCIAL PLOT ----------------------------------------------------
  { type: 'COMMERCIAL_PLOT', listing: 'FOR_SALE', city: 'Karachi', area: 'DHA', subArea: 'Phase 7', title: '500 Sq Yd Commercial Plot in DHA Phase 7', price: 195000000, beds: 0, baths: 0, sqft: 4500, desc: 'Corner commercial plot on a main commercial avenue in Phase 7, approved for ground-plus-four construction. Excellent frontage and high vehicle count.', featured: true },
  { type: 'COMMERCIAL_PLOT', listing: 'FOR_SALE', city: 'Lahore', area: 'DHA Defence', subArea: 'Phase 8', title: '8 Marla Commercial Plot in DHA Phase 8', price: 145000000, beds: 0, baths: 0, marla: 8, desc: 'Eight marla commercial plot in the Broadway commercial area of Phase 8, cleared for immediate construction.' },
  { type: 'COMMERCIAL_PLOT', listing: 'FOR_SALE', city: 'Islamabad', area: 'Blue Area', title: 'Commercial Plot in Blue Area', price: 480000000, beds: 0, baths: 0, sqft: 8000, desc: 'Prime Blue Area commercial plot on the main Jinnah Avenue service road, approved for a high-rise office development. CDA dues cleared.' },

  // ---- OFFICE -------------------------------------------------------------
  { type: 'OFFICE', listing: 'FOR_RENT', city: 'Islamabad', area: 'Blue Area', title: '3,000 Sq Ft Office Floor in Blue Area', price: 525000, beds: 0, baths: 3, sqft: 3000, desc: 'Full open-plan floor with a fitted reception, three washrooms, a pantry and a boardroom. Two lifts, standby generator and reserved parking for six cars.', featured: true },
  { type: 'OFFICE', listing: 'FOR_RENT', city: 'Karachi', area: 'Shahrah-e-Faisal', title: 'Corporate Office on Shahrah-e-Faisal', price: 780000, beds: 0, baths: 4, sqft: 4200, desc: 'Grade-A office space in a recognised Shahrah-e-Faisal tower, with central air conditioning, fibre connectivity and 24/7 building access.' },
  { type: 'OFFICE', listing: 'FOR_SALE', city: 'Lahore', area: 'Gulberg', title: 'Office Suite in Gulberg III', price: 42500000, beds: 0, baths: 2, sqft: 1800, desc: 'Fitted office suite on the third floor of a Gulberg III commercial building. Currently tenanted, giving immediate rental yield on purchase.' },
  { type: 'OFFICE', listing: 'FOR_RENT', city: 'Lahore', area: 'Johar Town', title: 'IT Office Space in Johar Town', price: 185000, beds: 0, baths: 2, sqft: 1500, desc: 'Open-plan office suited to a software team, with raised flooring for cabling, backup power and parking for four cars.' },

  // ---- SHOP ---------------------------------------------------------------
  { type: 'SHOP', listing: 'FOR_RENT', city: 'Lahore', area: 'Gulberg', title: 'Retail Shop in Liberty Market', price: 165000, beds: 0, baths: 1, sqft: 450, desc: 'Ground-floor retail unit with a glass frontage onto the main Liberty walkway. Very high pedestrian count through the evening and weekend trade.' },
  { type: 'SHOP', listing: 'FOR_SALE', city: 'Karachi', area: 'Tariq Road', title: 'Shop for Sale on Tariq Road', price: 38500000, beds: 0, baths: 1, sqft: 600, desc: 'Established retail shop on the busiest stretch of Tariq Road, with a mezzanine for storage. Sold with vacant possession.' },
  { type: 'SHOP', listing: 'FOR_RENT', city: 'Islamabad', area: 'F-10', subArea: 'F-10 Markaz', title: 'Shop in F-10 Markaz', price: 135000, beds: 0, baths: 1, sqft: 380, desc: 'Corner shop in F-10 Markaz with frontage on two sides. Suitable for a café, pharmacy or boutique.', fsbo: true },
  { type: 'SHOP', listing: 'FOR_SALE', city: 'Faisalabad', area: 'Madina Town', subArea: 'Block B', title: 'Commercial Shop in Madina Town', price: 22500000, beds: 0, baths: 1, sqft: 400, desc: 'Well-located shop on a busy Madina Town commercial street, currently rented to a long-standing tenant.' },

  // ---- BASEMENT / WAREHOUSE / FACTORY / BUILDING / INDUSTRIAL -------------
  { type: 'BASEMENT', listing: 'FOR_RENT', city: 'Lahore', area: 'Gulberg', title: 'Commercial Basement in Gulberg', price: 145000, beds: 0, baths: 2, sqft: 2200, desc: 'Dry, well-lit basement with a separate street entrance and a goods lift. Suitable for storage, a gym or a studio.' },
  { type: 'BASEMENT', listing: 'FOR_RENT', city: 'Karachi', area: 'Saddar', title: 'Storage Basement in Saddar', price: 95000, beds: 0, baths: 1, sqft: 1800, desc: 'Secure basement storage in Saddar with roller-shutter access and loading space at the rear.' },
  { type: 'WAREHOUSE', listing: 'FOR_RENT', city: 'Lahore', area: 'Manga Mandi', title: '12,000 Sq Ft Warehouse at Manga Mandi', price: 285000, beds: 0, baths: 2, sqft: 12000, desc: 'Clear-span warehouse with a 24-foot ceiling, two loading docks, three-phase power and a small site office. Direct access from Raiwind Road.' },
  { type: 'WAREHOUSE', listing: 'FOR_SALE', city: 'Karachi', area: 'Port Qasim', title: 'Warehouse Complex at Port Qasim', price: 385000000, beds: 0, baths: 4, sqft: 30000, desc: 'Large warehousing complex minutes from Port Qasim, with four loading docks, a weighbridge, staff facilities and a covered container yard.', featured: true },
  { type: 'FACTORY', listing: 'FOR_SALE', city: 'Lahore', area: 'Sundar Industrial Estate', title: 'Factory Unit in Sundar Industrial Estate', price: 265000000, beds: 0, baths: 6, sqft: 22000, desc: 'Operational factory unit with a machinery hall, two-storey office block, workers canteen and dedicated transformer. All PSIC approvals in place.' },
  { type: 'FACTORY', listing: 'FOR_RENT', city: 'Faisalabad', area: 'Sargodha Road', title: 'Textile Factory on Sargodha Road', price: 1250000, beds: 0, baths: 8, sqft: 45000, desc: 'Textile production facility available on long lease, with an existing power connection, boiler house, dyeing section and staff accommodation.' },
  { type: 'BUILDING', listing: 'FOR_SALE', city: 'Islamabad', area: 'G-11', subArea: 'G-11 Markaz', title: '5 Storey Commercial Building in G-11 Markaz', price: 720000000, beds: 0, baths: 12, sqft: 24000, desc: 'Complete five-storey commercial building with basement parking, two lifts and an existing tenant mix across retail and office floors. Strong in-place rental income.', featured: true },
  { type: 'BUILDING', listing: 'FOR_SALE', city: 'Lahore', area: 'Ferozepur Road', title: 'Commercial Building on Ferozepur Road', price: 395000000, beds: 0, baths: 9, sqft: 18000, desc: 'Four-storey building with main-road frontage, currently configured as offices with ground-floor retail. Lift, generator and basement parking.' },
  { type: 'INDUSTRIAL_LAND', listing: 'FOR_SALE', city: 'Lahore', area: 'Sundar Industrial Estate', title: '4 Kanal Industrial Plot in Sundar', price: 92000000, beds: 0, baths: 0, kanal: 4, desc: 'Four kanal industrial plot with an allotted power load and road access on two sides. Ready for construction of a production facility.' },
  { type: 'INDUSTRIAL_LAND', listing: 'FOR_SALE', city: 'Karachi', area: 'SITE Area', title: 'Industrial Plot in SITE Area', price: 148000000, beds: 0, baths: 0, sqft: 10000, desc: 'Industrial plot in the established SITE area with existing boundary wall, gas and heavy power connection available.' },

  // ---- a couple of non-ACTIVE rows so status handling is visible ----------
  { type: 'HOUSE', listing: 'FOR_SALE', city: 'Lahore', area: 'Model Town', title: '1 Kanal House in Model Town (Sold)', price: 115000000, beds: 5, baths: 5, kanal: 1, sqft: 5000, desc: 'This listing has been marked as sold and is retained for reference.', status: 'SOLD' },
  { type: 'FLAT', listing: 'FOR_RENT', city: 'Karachi', area: 'Clifton', title: '2 Bed Apartment in Clifton (Under Contract)', price: 125000, beds: 2, baths: 2, sqft: 1200, desc: 'This listing is currently under contract pending signature.', status: 'UNDER_CONTRACT' },
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

async function clean() {
  const found = await prisma.property.findMany({ where: { mlsSource: TAG }, select: { id: true } })
  if (found.length === 0) {
    console.log('No showcase listings found.')
    return
  }
  const ids = found.map((f) => f.id)
  await prisma.priceHistory.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.propertyImage.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.savedProperty.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.viewHistory.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.review.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.tourRequest.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.message.deleteMany({ where: { propertyId: { in: ids } } })
  await prisma.property.deleteMany({ where: { id: { in: ids } } })
  console.log(`Removed ${ids.length} showcase listings.`)
}

async function main() {
  if (process.argv.includes('--clean')) {
    await clean()
    return
  }

  // Re-running should replace, not duplicate.
  await clean()

  const agents = await prisma.agent.findMany({ select: { id: true } })
  const owners = await prisma.user.findMany({ where: { role: { in: ['BUYER', 'SELLER'] } }, select: { id: true } })
  console.log(`Seeding ${SPECS.length} showcase listings…\n`)

  let created = 0
  let skippedLocation = 0

  for (let i = 0; i < SPECS.length; i++) {
    const s = SPECS[i]
    const resolved = resolveLocation({ city: s.city, area: s.area, subArea: s.subArea })

    if (!resolved.citySlug) {
      console.log(`  ⚠️  skipped (city not in taxonomy): ${s.city} — ${s.title}`)
      skippedLocation++
      continue
    }

    const forRent = s.listing === 'FOR_RENT'
    const marla = s.marla ?? (s.kanal ? s.kanal * 20 : null)
    const images = imagesFor(s.type)

    const property = await prisma.property.create({
      data: {
        title: s.title,
        slug: buildListingSlug({ ...s, listingType: s.listing, propertyType: s.type }),
        description: s.desc,
        address: `${s.subArea ? s.subArea + ', ' : ''}${s.area}, ${s.city}`,
        city: s.city,
        province: '',
        area: s.area,
        subArea: s.subArea ?? null,
        citySlug: resolved.citySlug,
        areaSlug: resolved.areaSlug,
        subAreaSlug: resolved.subAreaSlug,
        country: 'Pakistan',
        latitude: 31.5204 + (Math.random() - 0.5) * 4,
        longitude: 74.3587 + (Math.random() - 0.5) * 6,
        price: s.price,
        bedrooms: s.beds,
        bathrooms: s.baths,
        squareFeet: s.sqft ?? null,
        marla,
        kanal: s.kanal ?? null,
        lotSize: s.kanal ? s.kanal * 0.125 : null,
        yearBuilt: 2012 + (i % 13),
        propertyType: s.type,
        listingType: s.listing,
        status: s.status ?? PropertyStatus.ACTIVE,
        isFeatured: s.featured ?? false,
        isVerified: i % 3 !== 0,
        isFSBO: s.fsbo ?? false,
        features: featuresFor(s.type),
        virtualTourUrl: i % 5 === 0 ? 'https://my.matterport.com/show/?m=SxQL3iGyoDo' : null,
        floorPlan: i % 6 === 0 ? images[0] : null,
        pkEstimate: Math.round(s.price * (1 + (Math.random() * 0.12 - 0.04))),
        pkEstimateChange: Math.round(s.price * (Math.random() * 0.03)),
        rentEstimate: forRent ? s.price : Math.round((s.price * 0.005) / 1000) * 1000,
        pricePerMarla: marla ? Math.round(s.price / marla) : null,
        pricePerSqft: s.sqft ? Math.round(s.price / s.sqft) : null,
        maintenanceFees: ['FLAT', 'PENTHOUSE', 'OFFICE', 'SHOP'].includes(s.type)
          ? 5000 + (i % 5) * 2500
          : null,
        taxAmount: Math.round(s.price * 0.01),
        parkingSpaces: s.beds > 0 ? Math.max(1, Math.round(s.beds / 2)) : 2 + (i % 4),
        garage: s.beds > 2,
        pool: s.price > 90000000,
        possession: pick(POSSESSION, i),
        furnishing: pick(FURNISHING, i),
        facing: pick(FACING, i),
        cornerProperty: i % 4 === 0,
        walkScore: 55 + (i % 40),
        transitScore: 45 + (i % 45),
        crimeScore: pick(CRIME, i),
        schoolRating: Math.round((6.5 + (i % 7) * 0.5) * 10) / 10,
        nearbyPlaces: nearbyFor(s.city),
        agentId: s.fsbo ? null : agents.length ? pick(agents, i).id : null,
        ownerId: s.fsbo && owners.length ? pick(owners, i).id : null,
        views: 40 + Math.floor(Math.random() * 900),
        mlsNumber: `MG-${String(1000 + i)}`,
        mlsSource: TAG,
        listedDate: new Date(Date.now() - (i % 60) * 86400000),
      },
    })

    // Province from the taxonomy, so it can never disagree with the city.
    const { getCity } = await import('../lib/locations')
    const cityDef = getCity(resolved.citySlug)
    if (cityDef) {
      await prisma.property.update({
        where: { id: property.id },
        data: { province: cityDef.province },
      })
    }

    // 4–5 images each
    const count = 4 + (i % 2)
    for (let n = 0; n < count; n++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: images[n % images.length],
          caption: ['Main View', 'Living Area', 'Bedroom', 'Kitchen', 'Exterior'][n] ?? `View ${n + 1}`,
          order: n,
        },
      })
    }

    // Price history: listed, then one or two revisions
    const listedAt = new Date(Date.now() - (90 + (i % 60)) * 86400000)
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: Math.round(s.price * 1.06),
        eventType: 'Listed',
        eventDate: listedAt,
      },
    })
    if (i % 2 === 0) {
      await prisma.priceHistory.create({
        data: {
          propertyId: property.id,
          price: Math.round(s.price * 1.02),
          eventType: 'Price Change',
          eventDate: new Date(listedAt.getTime() + 30 * 86400000),
        },
      })
    }
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        price: s.price,
        eventType: s.status === 'SOLD' ? 'Sold' : 'Price Change',
        eventDate: new Date(listedAt.getTime() + 60 * 86400000),
      },
    })

    created++
    process.stdout.write(`  ${String(created).padStart(2)}. ${property.slug}\n`)
  }

  console.log(`\n✅ Created ${created} showcase listings (${skippedLocation} skipped).`)
  console.log(`   Remove them later with: npx tsx prisma/seed-showcase.ts --clean`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
