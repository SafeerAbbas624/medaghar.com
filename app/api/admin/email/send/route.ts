import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { sendEmail, defaultHostingerConfig } from '@/lib/email'
import { createAuditLog } from '@/lib/audit-log'
import { getClientIp } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, text, html } = body

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'To, subject, and message content are required' },
        { status: 400 }
      )
    }

    // Send email
    const info = await sendEmail(defaultHostingerConfig, {
      to,
      subject,
      text,
      html,
    })

    // Log the action
    await createAuditLog({
      adminUserId: session.id,
      action: 'send_email',
      resource: 'email',
      details: {
        to: Array.isArray(to) ? to : [to],
        subject,
        messageId: info.messageId,
      },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    )
  }
}

