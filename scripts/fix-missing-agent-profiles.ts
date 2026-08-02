/**
 * Fix Missing Agent Profiles
 * 
 * This script creates Agent records for users who have role='AGENT' 
 * but don't have a corresponding Agent profile in the database.
 * 
 * Run with: npx tsx scripts/fix-missing-agent-profiles.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMissingAgentProfiles() {
  try {
    console.log('🔍 Checking for users with AGENT role...')

    // Find all users with AGENT role
    const agentUsers = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        agentProfile: true,
      },
    })

    console.log(`✅ Found ${agentUsers.length} users with AGENT role`)

    // Filter users who don't have an Agent profile
    const usersWithoutProfile = agentUsers.filter(user => !user.agentProfile)

    if (usersWithoutProfile.length === 0) {
      console.log('✅ All AGENT users already have Agent profiles!')
      return
    }

    console.log(`⚠️  Found ${usersWithoutProfile.length} AGENT users without Agent profiles:`)
    usersWithoutProfile.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`)
    })

    console.log('\n🔧 Creating missing Agent profiles...')

    // Create Agent profiles for users without one
    for (const user of usersWithoutProfile) {
      await prisma.agent.create({
        data: {
          userId: user.id,
          bio: '',
          specialties: JSON.stringify([]),
          yearsExperience: 0,
          phoneNumber: user.phone || '',
          officeAddress: '',
          website: '',
        },
      })
      console.log(`   ✅ Created Agent profile for ${user.firstName} ${user.lastName}`)
    }

    console.log(`\n✅ Successfully created ${usersWithoutProfile.length} Agent profiles!`)
    console.log('\n📝 Note: These agents now have default/empty profiles.')
    console.log('   They should update their profiles at /profile to add:')
    console.log('   - Bio')
    console.log('   - Specialties')
    console.log('   - Years of experience')
    console.log('   - Phone number')
    console.log('   - Office address')
    console.log('   - Website')

  } catch (error) {
    console.error('❌ Error fixing agent profiles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixMissingAgentProfiles()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

