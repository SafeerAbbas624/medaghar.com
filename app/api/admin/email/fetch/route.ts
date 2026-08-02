import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { fetchEmails } from '@/lib/imap-client'

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'INBOX'
    const limit = parseInt(searchParams.get('limit') || '50')

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

    // Map folder names to IMAP folder names
    // Hostinger uses INBOX.Sent, INBOX.Drafts, etc.
    const folderMap: Record<string, string> = {
      inbox: 'INBOX',
      sent: 'INBOX.Sent',
      drafts: 'INBOX.Drafts',
      trash: 'INBOX.Trash',
    }

    const imapFolder = folderMap[folder.toLowerCase()] || 'INBOX'

    // Fetch emails
    const emails = await fetchEmails(imapConfig, imapFolder, limit)

    return NextResponse.json({
      success: true,
      folder: imapFolder,
      count: emails.length,
      emails,
    })
  } catch (error: any) {
    console.error('Fetch emails error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch emails', 
        details: error.message,
        hint: 'Make sure IMAP is enabled in your Hostinger email settings'
      },
      { status: 500 }
    )
  }
}

