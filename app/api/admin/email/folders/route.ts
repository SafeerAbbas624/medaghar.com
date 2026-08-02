import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { getFolders } from '@/lib/imap-client'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get IMAP configuration from environment
    const imapConfig = {
      host: process.env.EMAIL_IMAP_HOST || 'imap.hostinger.com',
      port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      tls: true,
    }

    if (!imapConfig.user || !imapConfig.password) {
      return NextResponse.json(
        { error: 'Email configuration not set. Please configure email settings.' },
        { status: 400 }
      )
    }

    // Get list of folders
    const folders = await getFolders(imapConfig)

    return NextResponse.json({
      success: true,
      folders,
    })
  } catch (error: any) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get folders', 
        details: error.message,
      },
      { status: 500 }
    )
  }
}

