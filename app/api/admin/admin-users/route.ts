import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUsers = await prisma.adminUser.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ adminUsers })
  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, firstName, lastName, roleId } = body

    // Validate email domain
    if (!email.endsWith('@medaghar.com')) {
      return NextResponse.json(
        { error: 'Email must be a @medaghar.com address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roleId,
        createdBy: session.id,
      },
      include: {
        role: true,
      },
    })

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: AUDIT_ACTIONS.CREATE_ADMIN,
      resource: 'admin_users',
      resourceId: adminUser.id,
      details: { email, firstName, lastName, role: adminUser.role.name },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({ adminUser })
  } catch (error: any) {
    console.error('Create admin user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

