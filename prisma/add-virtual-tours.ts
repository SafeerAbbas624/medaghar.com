import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎥 Adding virtual tours to properties...')

  // Get all properties
  const properties = await prisma.property.findMany({
    take: 5,
  })

  if (properties.length === 0) {
    console.log('❌ No properties found in database')
    return
  }

  // Sample virtual tour URLs (using public demo tours)
  const virtualTours = [
    'https://my.matterport.com/show/?m=SxQL3iGyoDo', // Matterport demo
    'https://kuula.co/share/collection/7lGRN?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1', // Kuula demo
    'https://my.matterport.com/show/?m=j4RZx7ZGM6T', // Another Matterport
  ]

  const videoTours = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample YouTube video
    'https://vimeo.com/148751763', // Sample Vimeo video
    'https://www.youtube.com/watch?v=ysz5S6PUM-U', // Another YouTube
  ]

  // Update first 3 properties with virtual tours
  for (let i = 0; i < Math.min(3, properties.length); i++) {
    const property = properties[i]
    
    await prisma.property.update({
      where: { id: property.id },
      data: {
        virtualTourUrl: virtualTours[i % virtualTours.length],
        video3DTour: i < 2 ? videoTours[i % videoTours.length] : null, // Only first 2 get video tours
      },
    })

    console.log(`✅ Added virtual tour to: ${property.address}`)
  }

  console.log('🎉 Virtual tours added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

