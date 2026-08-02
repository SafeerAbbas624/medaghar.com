import { NextResponse } from 'next/server'
import { clearAdminSession } from '@/lib/admin-session'

export async function POST() {
  try {
    await clearAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}

