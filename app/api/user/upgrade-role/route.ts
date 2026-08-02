import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, hasUpgradedToAgent: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already an agent
    if (user.role === 'AGENT') {
      return NextResponse.json(
        { error: 'You are already an agent' },
        { status: 400 }
      )
    }

    // Check if already used one-time upgrade
    if (user.hasUpgradedToAgent) {
      return NextResponse.json(
        { error: 'You have already used your one-time upgrade to agent' },
        { status: 400 }
      )
    }

    // Only BUYER role can upgrade to AGENT
    if (user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Only users with BUYER role can upgrade to AGENT' },
        { status: 400 }
      )
    }

    // Upgrade user to AGENT and create Agent profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'AGENT',
        hasUpgradedToAgent: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        hasUpgradedToAgent: true,
      },
    })

    // Create Agent profile record
    await prisma.agent.create({
      data: {
        userId: session.user.id,
        bio: '',
        specialties: JSON.stringify([]),
        yearsExperience: 0,
        phoneNumber: updatedUser.phone || '',
        officeAddress: '',
        website: '',
      },
    })

    return NextResponse.json({
      message: 'Successfully upgraded to Agent',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('Upgrade role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

