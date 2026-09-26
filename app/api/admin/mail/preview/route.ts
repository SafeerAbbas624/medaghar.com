import { NextRequest, NextResponse } from 'next/server'
import { mailGuard } from '@/lib/mail/api'
import { buildOutgoing } from '@/lib/mail/outgoing'

export const dynamic = 'force-dynamic'

/** The exact HTML the composer would send, for the preview pane. */
export async function POST(request: NextRequest) {
  const { error } = await mailGuard(request)
  if (error) return error
  try {
    const form = await request.formData()
    form.delete('files') // attachments do not change the preview
    const out = await buildOutgoing(form, { requireRecipients: false })
    return NextResponse.json({ html: out.html })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
