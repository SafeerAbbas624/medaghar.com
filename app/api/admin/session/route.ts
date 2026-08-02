import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'

export async function GET() {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        role: session.role,
      },
      permissions: session.permissions,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

