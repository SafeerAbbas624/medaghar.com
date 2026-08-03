import { PrismaClient } from '@prisma/client'
import { resolveLocation } from './lib/locations'
import { withUniqueSlug } from './lib/listingSlug'
const prisma = new PrismaClient()

async function main() {
  // Simulates exactly what the POST handler does, incl. the manual escape
  // hatch (no slugs supplied by the client -> server resolves them).
  const body = {
    title: 'Test Listing', city: 'Lahore', area: 'DHA Phase 6', subArea: '',
    propertyType: 'HOUSE', listingType: 'FOR_SALE', marla: '10',
  }
  const r = resolveLocation({ city: body.city, area: body.area, subArea: body.subArea })
  console.log('resolved:', JSON.stringify(r))

  const p = await withUniqueSlug(
    { ...body, marla: body.marla },
    (slug) => prisma.property.create({
      data: {
        title: body.title, slug, address: 'Test St', city: body.city,
        province: 'Punjab', area: body.area, subArea: null,
        citySlug: r.citySlug, areaSlug: r.areaSlug, subAreaSlug: r.subAreaSlug,
        latitude: 31.5, longitude: 74.3, price: 42000000,
        bedrooms: 4, bathrooms: 5, marla: 10,
        propertyType: 'HOUSE', listingType: 'FOR_SALE', status: 'ACTIVE',
        description: 'Write-path verification.',
      },
    })
  )
  console.log('created slug :', p.slug)
  console.log('slug columns :', p.citySlug, '/', p.areaSlug, '/', p.subAreaSlug)

  // Verify it is reachable by the tree query shape
  const found = await prisma.property.count({
    where: { citySlug: 'lahore', areaSlug: 'dha-defence', subAreaSlug: 'phase-6', status: 'ACTIVE' },
  })
  console.log('tree query finds:', found, 'listing(s) at lahore/dha-defence/phase-6')

  await prisma.property.delete({ where: { id: p.id } })
  console.log('cleaned up test row')
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
