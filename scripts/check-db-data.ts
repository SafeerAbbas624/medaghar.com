import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('Checking database data...\n')

    const adminRoles = await prisma.adminRole.findMany()
    console.log(`AdminRole: ${adminRoles.length} records`)
    console.log(adminRoles)

    const adminUsers = await prisma.adminUser.findMany()
    console.log(`\nAdminUser: ${adminUsers.length} records`)
    console.log(adminUsers)

    const users = await prisma.user.findMany()
    console.log(`\nUser: ${users.length} records`)

    const properties = await prisma.property.findMany()
    console.log(`Property: ${properties.length} records`)

    const agents = await prisma.agent.findMany()
    console.log(`Agent: ${agents.length} records`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()

