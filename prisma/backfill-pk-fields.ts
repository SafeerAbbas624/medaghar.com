/**
 * Backfill the Pakistan-specific fields onto existing demo listings.
 *
 * The showcase seeder populates these on anything it creates from now on, but
 * listings seeded before the fields existed would render with empty panels.
 * This fills them with values appropriate to each listing's city and type so
 * the whole site can be reviewed as it will actually look.
 *
 * It also stamps listingSource so --clean can find these rows again: the
 * showcase seeder used to tag with mlsSource, which has been dropped.
 *
 *   npx tsx prisma/backfill-pk-fields.ts
 *   npx tsx prisma/backfill-pk-fields.ts --dry
 */

import { PrismaClient, ListingType } from '@prisma/client'
import { isLandType, asksFloorNumber, asksRoomCounts, asksUtilities } from '../lib/listingFields'

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry')

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

/** Amenities in the vocabulary Pakistani listings actually use. */
function nearbyFor(city: string, i: number): string {
  const core: [string, string][] = [
    ['masjid', 'Walking distance'],
    ['park', 'Walking distance'],
    ['market', 'Walking distance'],
    ['superstore', i % 2 === 0 ? 'Walking distance' : 'Under 5 min drive'],
    ['school', i % 3 === 0 ? 'Walking distance' : 'Under 5 min drive'],
  ]
  const byCity: Record<string, [string, string][]> = {
    Lahore: [
      ['mall', 'Under 5 min drive'],
      ['hospital', '5-10 min drive'],
      ['mainroad', 'Walking distance'],
      ['transport', 'Under 5 min drive'],
      ['restaurant', 'Walking distance'],
    ],
    Karachi: [
      ['mall', '5-10 min drive'],
      ['hospital', '5-10 min drive'],
      ['mainroad', 'Under 5 min drive'],
      ['transport', 'Walking distance'],
      ['bank', 'Walking distance'],
    ],
    Islamabad: [
      ['mall', '10-20 min drive'],
      ['hospital', '5-10 min drive'],
      ['mainroad', 'Under 5 min drive'],
      ['university', '5-10 min drive'],
      ['gym', 'Under 5 min drive'],
    ],
    Rawalpindi: [
      ['transport', 'Walking distance'],
      ['hospital', 'Under 5 min drive'],
      ['mainroad', 'Walking distance'],
      ['bank', 'Under 5 min drive'],
    ],
  }
  const extra = byCity[city] ?? [
    ['hospital', '5-10 min drive'],
    ['mainroad', 'Under 5 min drive'],
    ['pharmacy', 'Walking distance'],
    ['petrol', 'Under 5 min drive'],
  ]
  return JSON.stringify([...core, ...extra].map(([type, distance]) => ({ type, distance })))
}

function landmarkFor(city: string, i: number): string {
  const byCity: Record<string, string[]> = {
    Lahore: [
      'Opposite Emporium Mall, 2 minutes from Main Boulevard',
      'Near Shaukat Khanum Hospital, off Jail Road',
      'Behind Beaconhouse School, near the community park',
    ],
    Karachi: [
      'Near Dolmen Mall Clifton, off Khayaban-e-Iqbal',
      'Walking distance from Shahrah-e-Faisal, near Aga Khan Hospital',
      'Opposite the main commercial market, near Jamia Masjid',
    ],
    Islamabad: [
      'Near Centaurus Mall, 5 minutes from Jinnah Avenue',
      'Off Islamabad Expressway, near Shifa International Hospital',
      'Adjacent to the sector park, near the main markaz',
    ],
    Rawalpindi: [
      'Near Metro Bus station, off Murree Road',
      'Walking distance from the main commercial market',
      'Opposite the community park, near Jamia Masjid',
    ],
  }
  const list = byCity[city] ?? [
    'Near the main bazaar, opposite Jamia Masjid',
    'Walking distance from the district hospital and main road',
    'Adjacent to the government high school, near the community park',
  ]
  return list[i % list.length]
}

const DOCUMENTS = ['Registry', 'Allotment Letter', 'Fard / Intiqal', 'File']
const APPROVALS = ['LDA (Lahore)', 'CDA (Islamabad)', 'DHA', 'RDA (Rawalpindi)', 'KDA (Karachi)']
const BACKUP = ['Generator', 'Solar', 'Generator + Solar', 'UPS']
const WATER = ['Government Supply', 'Boring', 'Motor / Submersible', 'Government Supply + Boring']
const TENANTS = ['Family Only', 'Any', 'Bachelors Allowed', 'Office Use']

async function main() {
  const listings = await prisma.property.findMany({
    select: { id: true, city: true, price: true, propertyType: true, listingType: true, title: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`${listings.length} listings to backfill${DRY ? ' (dry run)' : ''}\n`)

  let done = 0
  for (const [i, l] of listings.entries()) {
    const type = l.propertyType as string
    const forRent = l.listingType === ListingType.FOR_RENT
    const land = isLandType(type)

    const data = {
      listingSource: 'SHOWCASE',
      nearbyPlaces: nearbyFor(l.city, i),
      nearbyLandmark: landmarkFor(l.city, i),

      documentType: pick(DOCUMENTS, i),
      approvalAuthority: pick(APPROVALS, i),
      nocAvailable: i % 4 !== 0,
      installmentsAvailable: land && i % 3 === 0,
      installmentMonths: land && i % 3 === 0 ? 24 + (i % 3) * 12 : null,
      downPayment: land && i % 3 === 0 ? Math.round(l.price * 0.3) : null,

      // A plot file has no connections to describe.
      hasElectricity: asksUtilities(type) ? true : null,
      hasSuiGas: asksUtilities(type) ? i % 6 !== 0 : null,
      backupPower: asksUtilities(type) ? pick(BACKUP, i) : null,
      waterSource: asksUtilities(type) ? pick(WATER, i) : null,

      advanceMonths: forRent ? 2 + (i % 2) : null,
      securityDeposit: forRent ? Math.round(l.price * 2) : null,
      rentIncrementPct: forRent ? 10 : null,
      tenantPreference: forRent ? pick(TENANTS, i) : null,

      floors: land ? null : 1 + (i % 3),
      floorNumber: asksFloorNumber(type) ? i % 5 : null,
      hasLift: asksFloorNumber(type) ? i % 3 === 0 : null,
      plotWidthFt: 25 + (i % 4) * 5,
      plotLengthFt: 50 + (i % 4) * 10,
      roadWidthFt: [20, 30, 40, 60][i % 4],
      kitchens: asksRoomCounts(type) ? 1 + (i % 2) : null,
      storeRooms: asksRoomCounts(type) ? i % 3 : null,
      drawingRoom: asksRoomCounts(type) && i % 2 === 0,
      tvLounge: asksRoomCounts(type) && i % 2 === 1,
      servantQuarter: asksRoomCounts(type) && i % 3 === 0,
    }

    if (DRY) {
      if (i < 3) console.log(`  ${l.title.slice(0, 50)}\n    ${JSON.stringify(data).slice(0, 160)}...\n`)
      continue
    }

    await prisma.property.update({ where: { id: l.id }, data })
    done++
  }

  console.log(DRY ? 'Dry run — nothing written.' : `Backfilled ${done} listings.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
