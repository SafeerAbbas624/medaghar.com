import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { verifyEmailConfig, defaultHostingerConfig } from '@/lib/email'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return current config (without password)
    return NextResponse.json({
      config: {
        host: defaultHostingerConfig.host,
        port: defaultHostingerConfig.port,
        secure: defaultHostingerConfig.secure,
        user: defaultHostingerConfig.user,
      },
    })
  } catch (error: any) {
    console.error('Get email config error:', error)
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
    const { host, port, secure, user, password } = body

    if (!host || !port || !user || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const config = { host, port, secure, user, password }

    // Verify the configuration
    const isValid = await verifyEmailConfig(config)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email configuration. Please check your credentials.' },
        { status: 400 }
      )
    }

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: 'update_email_config',
      resource: 'email_config',
      details: { host, port, user },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      message: 'Email configuration verified and saved',
    })
  } catch (error: any) {
    console.error('Update email config error:', error)
    return NextResponse.json(
      { error: 'Failed to update email configuration', details: error.message },
      { status: 500 }
    )
  }
}

