import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding messages...')

  // Get some users
  const users = await prisma.user.findMany({
    take: 5,
  })

  if (users.length < 2) {
    console.log('Not enough users found. Please run the main seed first.')
    return
  }

  // Get some properties
  const properties = await prisma.property.findMany({
    take: 3,
  })

  if (properties.length === 0) {
    console.log('No properties found. Please run the main seed first.')
    return
  }

  // Create messages between users
  const messages = [
    {
      senderId: users[0].id,
      receiverId: users[1].id,
      propertyId: properties[0].id,
      subject: 'Inquiry about property',
      content: `Hi, I'm interested in the property at ${properties[0].address}. Is it still available? I would like to schedule a viewing. Please let me know your availability. Thank you!`,
      isRead: false,
    },
    {
      senderId: users[1].id,
      receiverId: users[0].id,
      propertyId: properties[0].id,
      subject: 'Re: Inquiry about property',
      content: `Hello! Yes, the property is still available. I can arrange a viewing for you this week. Are you available on Thursday or Friday afternoon? Looking forward to hearing from you.`,
      isRead: true,
    },
    {
      senderId: users[0].id,
      receiverId: users[1].id,
      propertyId: properties[0].id,
      subject: 'Re: Inquiry about property',
      content: `Thursday afternoon works perfectly for me. What time would be convenient? Also, could you please share more details about the parking facilities and maintenance charges?`,
      isRead: false,
    },
    {
      senderId: users[2].id,
      receiverId: users[1].id,
      propertyId: properties[1].id,
      subject: 'Price negotiation',
      content: `I visited the property yesterday and I'm very interested. However, the asking price is slightly above my budget. Would you be open to negotiating the price?`,
      isRead: false,
    },
    {
      senderId: users[3].id,
      receiverId: users[0].id,
      propertyId: properties[2].id,
      subject: 'Questions about amenities',
      content: `I saw your listing and have a few questions:\n\n1. Is the property furnished?\n2. Are pets allowed?\n3. What utilities are included in the rent?\n4. When is the earliest move-in date?\n\nThank you for your time.`,
      isRead: true,
    },
    {
      senderId: users[1].id,
      receiverId: users[2].id,
      subject: 'General inquiry',
      content: `Hello, I'm looking for a property in DHA Lahore. Do you have any listings in that area? My budget is around PKR 2-3 Crore. Please let me know if you have anything suitable.`,
      isRead: false,
    },
    {
      senderId: users[4].id,
      receiverId: users[1].id,
      propertyId: properties[0].id,
      subject: 'Documentation required',
      content: `I'm ready to proceed with the property. Could you please let me know what documents I need to prepare? Also, what is the process for booking and payment?`,
      isRead: false,
    },
    {
      senderId: users[0].id,
      receiverId: users[3].id,
      subject: 'Investment opportunity',
      content: `I'm looking for investment properties in Karachi. Do you have any commercial properties or plots available? I'm particularly interested in areas with high growth potential.`,
      isRead: true,
    },
  ]

  for (const messageData of messages) {
    await prisma.message.create({
      data: messageData,
    })
  }

  console.log(`Created ${messages.length} messages`)

  // Get message count for each user
  for (const user of users.slice(0, 3)) {
    const inbox = await prisma.message.count({
      where: { receiverId: user.id },
    })
    const sent = await prisma.message.count({
      where: { senderId: user.id },
    })
    const unread = await prisma.message.count({
      where: { receiverId: user.id, isRead: false },
    })
    
    console.log(`\n${user.firstName} ${user.lastName} (${user.email}):`)
    console.log(`  Inbox: ${inbox} messages (${unread} unread)`)
    console.log(`  Sent: ${sent} messages`)
  }

  console.log('\n✅ Messages seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

