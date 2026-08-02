import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding rental data...')

  // Create a landlord user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@example.com' },
    update: {},
    create: {
      email: 'landlord@example.com',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Khan',
      phone: '+92-300-1234567',
      role: 'LANDLORD',
    },
  })

  console.log('Created landlord:', landlord.email)

  // Create tenant users
  const tenant1 = await prisma.user.upsert({
    where: { email: 'tenant1@example.com' },
    update: {},
    create: {
      email: 'tenant1@example.com',
      password: hashedPassword,
      firstName: 'Fatima',
      lastName: 'Ali',
      phone: '+92-321-9876543',
      role: 'TENANT',
    },
  })

  const tenant2 = await prisma.user.upsert({
    where: { email: 'tenant2@example.com' },
    update: {},
    create: {
      email: 'tenant2@example.com',
      password: hashedPassword,
      firstName: 'Hassan',
      lastName: 'Malik',
      phone: '+92-333-5555555',
      role: 'TENANT',
    },
  })

  console.log('Created tenants:', tenant1.email, tenant2.email)

  // Get some rental properties
  const rentalProperties = await prisma.property.findMany({
    where: {
      listingType: 'FOR_RENT',
    },
    take: 3,
  })

  if (rentalProperties.length === 0) {
    console.log('No rental properties found. Please run the main seed first.')
    return
  }

  // Update properties to have the landlord as owner
  for (const property of rentalProperties) {
    await prisma.property.update({
      where: { id: property.id },
      data: { ownerId: landlord.id },
    })
  }

  console.log(`Updated ${rentalProperties.length} properties with landlord owner`)

  // Create leases
  const lease1 = await prisma.lease.create({
    data: {
      propertyId: rentalProperties[0].id,
      tenantId: tenant1.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      monthlyRent: rentalProperties[0].price,
      securityDeposit: rentalProperties[0].price * 2,
      status: 'ACTIVE',
      terms: 'Standard 1-year lease agreement. Tenant responsible for utilities. No pets allowed.',
    },
  })

  console.log('Created lease 1:', lease1.id)

  if (rentalProperties.length > 1) {
    const lease2 = await prisma.lease.create({
      data: {
        propertyId: rentalProperties[1].id,
        tenantId: tenant2.id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-06-01'),
        monthlyRent: rentalProperties[1].price,
        securityDeposit: rentalProperties[1].price * 2,
        status: 'ACTIVE',
        terms: 'Standard 1-year lease agreement. Utilities included. Pets allowed with additional deposit.',
      },
    })

    console.log('Created lease 2:', lease2.id)
  }

  // Create rent payments
  const currentDate = new Date()
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

  // Last month payment - PAID
  await prisma.rentPayment.create({
    data: {
      leaseId: lease1.id,
      tenantId: tenant1.id,
      amount: rentalProperties[0].price,
      dueDate: lastMonth,
      paidDate: lastMonth,
      status: 'PAID',
      paymentMethod: 'Bank Transfer',
    },
  })

  // This month payment - PAID
  await prisma.rentPayment.create({
    data: {
      leaseId: lease1.id,
      tenantId: tenant1.id,
      amount: rentalProperties[0].price,
      dueDate: thisMonth,
      paidDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
      status: 'PAID',
      paymentMethod: 'Bank Transfer',
    },
  })

  // Next month payment - PENDING
  await prisma.rentPayment.create({
    data: {
      leaseId: lease1.id,
      tenantId: tenant1.id,
      amount: rentalProperties[0].price,
      dueDate: nextMonth,
      status: 'PENDING',
    },
  })

  if (rentalProperties.length > 1) {
    // Overdue payment for tenant 2
    const overdueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    await prisma.rentPayment.create({
      data: {
        leaseId: lease1.id,
        tenantId: tenant2.id,
        amount: rentalProperties[1].price,
        dueDate: overdueDate,
        status: 'OVERDUE',
      },
    })
  }

  console.log('Created rent payments')

  // Create maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      propertyId: rentalProperties[0].id,
      tenantId: tenant1.id,
      title: 'Leaking Kitchen Faucet',
      description: 'The kitchen faucet has been leaking for the past week. Water drips constantly even when turned off completely.',
      priority: 'MEDIUM',
      status: 'PENDING',
      category: 'Plumbing',
    },
  })

  await prisma.maintenanceRequest.create({
    data: {
      propertyId: rentalProperties[0].id,
      tenantId: tenant1.id,
      title: 'Air Conditioner Not Cooling',
      description: 'The AC in the master bedroom is not cooling properly. It runs but only blows warm air.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'HVAC',
      cost: 5000,
    },
  })

  if (rentalProperties.length > 1) {
    await prisma.maintenanceRequest.create({
      data: {
        propertyId: rentalProperties[1].id,
        tenantId: tenant2.id,
        title: 'Broken Window Lock',
        description: 'The lock on the living room window is broken and needs replacement for security.',
        priority: 'URGENT',
        status: 'PENDING',
        category: 'Security',
      },
    })

    await prisma.maintenanceRequest.create({
      data: {
        propertyId: rentalProperties[1].id,
        tenantId: tenant2.id,
        title: 'Light Fixture Replacement',
        description: 'The light fixture in the hallway is flickering and needs to be replaced.',
        priority: 'LOW',
        status: 'COMPLETED',
        category: 'Electrical',
        cost: 2000,
        completedDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 5),
      },
    })
  }

  console.log('Created maintenance requests')

  console.log('✅ Rental data seeding completed!')
  console.log('\nLandlord credentials:')
  console.log('Email: landlord@example.com')
  console.log('Password: password123')
  console.log('\nTenant 1 credentials:')
  console.log('Email: tenant1@example.com')
  console.log('Password: password123')
  console.log('\nTenant 2 credentials:')
  console.log('Email: tenant2@example.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

