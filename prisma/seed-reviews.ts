import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding reviews...')

  // Get some users and properties
  const users = await prisma.user.findMany({ take: 5 })
  const properties = await prisma.property.findMany({ take: 10 })
  const agents = await prisma.agent.findMany({ take: 5 })

  if (users.length === 0 || properties.length === 0) {
    console.log('No users or properties found. Please seed users and properties first.')
    return
  }

  // Sample reviews for properties
  const propertyReviews = [
    {
      userId: users[0].id,
      propertyId: properties[0].id,
      rating: 5,
      title: 'Excellent Property in Prime Location',
      comment: 'This property exceeded all my expectations. The location is perfect, close to all amenities, and the build quality is outstanding. The neighborhood is safe and family-friendly. Highly recommended!',
      pros: JSON.stringify(['Prime location', 'Modern amenities', 'Safe neighborhood', 'Good build quality']),
      cons: JSON.stringify(['Slightly expensive', 'Limited parking']),
      wouldRecommend: true,
      verified: true,
    },
    {
      userId: users[1].id,
      propertyId: properties[0].id,
      rating: 4,
      title: 'Great Value for Money',
      comment: 'Overall a good property with excellent facilities. The area is well-developed with schools, hospitals, and shopping centers nearby. The only downside is the traffic during peak hours.',
      pros: JSON.stringify(['Good value', 'Well-developed area', 'Modern design']),
      cons: JSON.stringify(['Traffic congestion', 'Needs better maintenance']),
      wouldRecommend: true,
      verified: false,
    },
    {
      userId: users[2].id,
      propertyId: properties[1].id,
      rating: 5,
      title: 'Perfect Family Home',
      comment: 'We moved in 6 months ago and absolutely love it! The house is spacious, well-ventilated, and has a beautiful garden. The community is very welcoming and there are plenty of parks for kids.',
      pros: JSON.stringify(['Spacious rooms', 'Beautiful garden', 'Family-friendly community', 'Good ventilation']),
      cons: JSON.stringify(['Distance from main road']),
      wouldRecommend: true,
      verified: true,
    },
    {
      userId: users[3].id,
      propertyId: properties[2].id,
      rating: 3,
      title: 'Decent Property but Needs Renovation',
      comment: 'The location is good and the price is reasonable, but the property needs some renovation work. The plumbing and electrical systems are outdated. Good potential if you are willing to invest in upgrades.',
      pros: JSON.stringify(['Good location', 'Reasonable price', 'Large plot size']),
      cons: JSON.stringify(['Needs renovation', 'Outdated fixtures', 'Poor maintenance']),
      wouldRecommend: false,
      verified: false,
    },
    {
      userId: users[4].id,
      propertyId: properties[3].id,
      rating: 5,
      title: 'Luxury Living at Its Best',
      comment: 'This is a premium property with world-class amenities. The gym, swimming pool, and clubhouse are excellent. Security is top-notch with 24/7 surveillance. Worth every penny!',
      pros: JSON.stringify(['Luxury amenities', 'Excellent security', 'Modern architecture', 'Professional management']),
      cons: JSON.stringify(['High maintenance charges']),
      wouldRecommend: true,
      verified: true,
    },
    {
      userId: users[0].id,
      propertyId: properties[4].id,
      rating: 4,
      title: 'Good Investment Opportunity',
      comment: 'Bought this as an investment property and very happy with the decision. The area is developing rapidly and property values are increasing. Good rental yield as well.',
      pros: JSON.stringify(['Developing area', 'Good ROI', 'Easy to rent out']),
      cons: JSON.stringify(['Construction still ongoing nearby']),
      wouldRecommend: true,
      verified: true,
    },
  ]

  // Sample reviews for agents
  const agentReviews = agents.length > 0 ? [
    {
      userId: users[1].id,
      agentId: agents[0].id,
      rating: 5,
      title: 'Highly Professional and Helpful',
      comment: 'Working with this agent was a pleasure. They were very knowledgeable about the market, responsive to all my queries, and helped me find the perfect property within my budget. Highly recommended!',
      pros: JSON.stringify(['Very responsive', 'Market knowledge', 'Professional approach', 'Honest advice']),
      cons: JSON.stringify([]),
      wouldRecommend: true,
      verified: true,
    },
    {
      userId: users[2].id,
      agentId: agents[0].id,
      rating: 4,
      title: 'Good Service Overall',
      comment: 'The agent was helpful and showed me several properties that matched my requirements. The process was smooth and they handled all the paperwork efficiently.',
      pros: JSON.stringify(['Good communication', 'Efficient paperwork', 'Multiple options']),
      cons: JSON.stringify(['Could be more proactive']),
      wouldRecommend: true,
      verified: false,
    },
    {
      userId: users[3].id,
      agentId: agents[1]?.id,
      rating: 5,
      title: 'Excellent Negotiation Skills',
      comment: 'This agent helped me get a great deal on my property. Their negotiation skills are outstanding and they really fought for my interests. Very satisfied with the service.',
      pros: JSON.stringify(['Great negotiator', 'Client-focused', 'Experienced', 'Trustworthy']),
      cons: JSON.stringify([]),
      wouldRecommend: true,
      verified: true,
    },
  ] : []

  // Create reviews
  for (const review of propertyReviews) {
    try {
      await prisma.review.create({
        data: review,
      })
      console.log(`Created property review: ${review.title}`)
    } catch (error) {
      console.error(`Error creating review: ${review.title}`, error)
    }
  }

  for (const review of agentReviews) {
    if (review.agentId) {
      try {
        await prisma.review.create({
          data: review,
        })
        console.log(`Created agent review: ${review.title}`)
      } catch (error) {
        console.error(`Error creating review: ${review.title}`, error)
      }
    }
  }

  console.log('Reviews seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

