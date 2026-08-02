import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AdminSession {
  id: string
  email: string
  role: string
  roleId: string
  permissions: Array<{ resource: string; actions: string[] }>
}

export interface AdminPermission {
  resource: string
  actions: string[]
}

export interface VerifyResult {
  session: AdminSession | null
  error: NextResponse | null
}

/**
 * Verify admin session and check permissions
 * This runs on the SERVER SIDE - cannot be bypassed by client
 */
export async function verifyAdminPermission(
  request: Request,
  requiredResource: string,
  requiredAction: 'read' | 'write' | 'delete' | 'export' = 'read'
): Promise<VerifyResult> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
      return {
        session: null,
        error: NextResponse.json(
          { error: 'Admin authentication required' },
          { status: 401 }
        ),
      }
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET not configured')
      return {
        session: null,
        error: NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        ),
      }
    }

    let decoded: AdminSession
    try {
      decoded = verify(token.value, secret) as AdminSession
    } catch (err) {
      return {
        session: null,
        error: NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        ),
      }
    }

    // Check if admin user still exists and is active
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true, roleId: true },
    })

    if (!adminUser || !adminUser.isActive) {
      return {
        session: null,
        error: NextResponse.json(
          { error: 'Admin account deactivated' },
          { status: 403 }
        ),
      }
    }

    // Check permissions
    const permission = decoded.permissions.find(
      (p) => p.resource === requiredResource && p.actions.includes(requiredAction)
    )

    if (!permission) {
      return {
        session: decoded,
        error: NextResponse.json(
          { error: `Insufficient permissions: ${requiredResource}:${requiredAction} required` },
          { status: 403 }
        ),
      }
    }

    return { session: decoded, error: null }
  } catch (error) {
    console.error('Admin permission verification error:', error)
    return {
      session: null,
      error: NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Get admin session without permission check (for routes that do their own checks)
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) return null

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return null

    const decoded = verify(token.value, secret) as AdminSession

    // Verify user still exists and is active
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true },
    })

    if (!adminUser || !adminUser.isActive) return null

    return decoded
  } catch {
    return null
  }
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
}

/**
 * Higher-order function to wrap admin API handlers with permission checks
 */
export function withAdminAuth(
  handler: (request: Request, session: AdminSession) => Promise<NextResponse>,
  resource: string,
  action: 'read' | 'write' | 'delete' | 'export' = 'read'
) {
  return async (request: Request) => {
    const { session, error } = await verifyAdminPermission(request, resource, action)

    if (error) return error
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return handler(request, session)
  }
}

/**
 * Check if admin has specific permission (for inline checks)
 */
export async function checkAdminPermission(
  request: Request,
  resource: string,
  action: string = 'read'
): Promise<{ allowed: boolean; session: AdminSession | null }> {
  const session = await getAdminSession()

  if (!session) {
    return { allowed: false, session: null }
  }

  const hasPermission = session.permissions.some(
    (p) => p.resource === resource && p.actions.includes(action)
  )

  return { allowed: hasPermission, session }
}