import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Verifying admin user...\n')

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: 'info@medaghar.com' },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  if (adminUser) {
    console.log('✅ Admin user found!')
    console.log('Email:', adminUser.email)
    console.log('Name:', adminUser.firstName, adminUser.lastName)
    console.log('Role:', adminUser.role.name)
    console.log('Active:', adminUser.isActive)
    console.log('Created:', adminUser.createdAt)
    console.log('\nPermissions:')
    adminUser.role.permissions.forEach((perm) => {
      console.log(`  - ${perm.resource}: ${perm.actions}`)
    })
  } else {
    console.log('❌ Admin user NOT found!')
  }

  // Also check all admin users
  const allAdmins = await prisma.adminUser.findMany()
  console.log(`\nTotal admin users in database: ${allAdmins.length}`)
  allAdmins.forEach((admin) => {
    console.log(`  - ${admin.email} (${admin.firstName} ${admin.lastName})`)
  })
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

