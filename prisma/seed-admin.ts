import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding admin system...')

  // Create Admin Roles
  const adminRole = await prisma.adminRole.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Full system access with all permissions',
    },
  })

  const adminAssistantRole = await prisma.adminRole.upsert({
    where: { name: 'Admin Assistant' },
    update: {},
    create: {
      name: 'Admin Assistant',
      description: 'Limited admin access for support tasks',
    },
  })

  const editorRole = await prisma.adminRole.upsert({
    where: { name: 'Editor' },
    update: {},
    create: {
      name: 'Editor',
      description: 'Content management and editing permissions',
    },
  })

  console.log('Created admin roles')

  // Create Admin Permissions for Admin role (full access)
  const adminResources = [
    'traffic_analytics',
    'database_management',
    'user_management',
    'admin_user_management',
    'email_management',
    'contact_submissions',
  ]

  for (const resource of adminResources) {
    await prisma.adminPermission.upsert({
      where: {
        roleId_resource: {
          roleId: adminRole.id,
          resource,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        resource,
        actions: JSON.stringify(['read', 'write', 'delete', 'export', 'import']),
      },
    })
  }

  // Create Admin Permissions for Admin Assistant role (limited access)
  const assistantResources = [
    { resource: 'traffic_analytics', actions: ['read'] },
    { resource: 'user_management', actions: ['read', 'write'] },
    { resource: 'email_management', actions: ['read', 'write'] },
    { resource: 'contact_submissions', actions: ['read', 'write'] },
  ]

  for (const { resource, actions } of assistantResources) {
    await prisma.adminPermission.upsert({
      where: {
        roleId_resource: {
          roleId: adminAssistantRole.id,
          resource,
        },
      },
      update: {},
      create: {
        roleId: adminAssistantRole.id,
        resource,
        actions: JSON.stringify(actions),
      },
    })
  }

  // Create Admin Permissions for Editor role
  const editorResources = [
    { resource: 'database_management', actions: ['read', 'write'] },
    { resource: 'user_management', actions: ['read'] },
  ]

  for (const { resource, actions } of editorResources) {
    await prisma.adminPermission.upsert({
      where: {
        roleId_resource: {
          roleId: editorRole.id,
          resource,
        },
      },
      update: {},
      create: {
        roleId: editorRole.id,
        resource,
        actions: JSON.stringify(actions),
      },
    })
  }

  console.log('Created admin permissions')

  // Create primary admin user
  const adminPassword = process.env.ADMIN_SEED_PASSWORD
  if (!adminPassword) {
    throw new Error('ADMIN_SEED_PASSWORD env var is required to seed the admin user')
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const primaryAdmin = await prisma.adminUser.upsert({
    where: { email: 'info@medaghar.com' },
    update: {},
    create: {
      email: 'info@medaghar.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
      isActive: true,
    },
  })

  console.log('Created primary admin user:', primaryAdmin.email)
  console.log('Admin system seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

