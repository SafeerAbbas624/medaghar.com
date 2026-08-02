import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const body = await request.json()
    const { firstName, lastName, roleId, isActive } = body

    // Update admin user
    const updatedUser = await prisma.adminUser.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        roleId,
        isActive,
      },
      include: {
        role: true,
      },
    })

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: AUDIT_ACTIONS.UPDATE_ADMIN,
      resource: 'admin_users',
      resourceId: userId,
      details: { firstName, lastName, role: updatedUser.role.name, isActive },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({ adminUser: updatedUser })
  } catch (error: any) {
    console.error('Update admin user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Prevent deleting yourself
    if (userId === session.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user info before deletion
    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete admin user
    await prisma.adminUser.delete({
      where: { id: userId },
    })

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: AUDIT_ACTIONS.DELETE_ADMIN,
      resource: 'admin_users',
      resourceId: userId,
      details: { email: user.email, role: user.role.name },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete admin user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

