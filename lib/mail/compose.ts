/**
 * Building outgoing mail for the ops console: the branded shell shared with
 * the site's own emails, the signature, the quoted original, and a plain-text
 * alternative.
 */

import { prisma } from '@/lib/prisma'
import { layout, esc, SITE } from '@/lib/email/shell'

/** Keep only the body of a stored message and drop anything that could restyle or script ours. */
export function cleanQuotedHtml(html: string): string {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  return body
    .replace(/<(script|style|head|title|meta|link)\b[\s\S]*?(<\/\1>|\/?>)/gi, '')
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, '')
}

export function textToHtml(text: string): string {
  return esc(text).replace(/\r?\n/g, '<br>')
}

export function quoteBlock(o: { date: string; from: string; html?: string | null; text?: string | null }): string {
  const when = new Date(o.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' })
  const inner = o.html ? cleanQuotedHtml(o.html) : textToHtml(o.text ?? '')
  return `<div style="margin-top:28px;">
  <p style="margin:0 0 8px;font-size:13px;color:#64748b;">On ${esc(when)}, ${esc(o.from)} wrote:</p>
  <blockquote style="margin:0;padding:0 0 0 14px;border-left:3px solid #cbd5e1;color:#475569;">${inner}</blockquote>
</div>`
}

/**
 * The full HTML of an outgoing message. `branded` wraps it in the same header
 * and footer as the sign-up and password emails; unbranded is a plain letter
 * (better for short, personal back-and-forth).
 */
export function buildOutgoingHtml(o: {
  subject: string
  bodyHtml: string
  signatureHtml?: string | null
  quotedHtml?: string | null
  branded: boolean
}): string {
  const content = `${o.bodyHtml}${o.signatureHtml ? `<div style="margin-top:24px;">${o.signatureHtml}</div>` : ''}${o.quotedHtml ?? ''}`
  if (o.branded) return layout(esc(o.subject), content)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#334155;">${content}</body></html>`
}

/** Plain-text alternative for clients that do not show HTML. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script|head)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) =>
      label.replace(/<[^>]+>/g, '').trim() === href ? href : `${label} (${href})`
    )
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ---------------------------------------------------------------------------
// Defaults, created the first time the mailbox settings are opened
// ---------------------------------------------------------------------------

const DEFAULT_SIGNATURE = `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <tr>
    <td style="padding-right:14px;vertical-align:top;"><img src="${SITE}/email-logo.png" alt="MedaGhar" width="72" height="47" style="display:block;border:0;border-radius:6px;"></td>
    <td style="border-left:2px solid #0e7490;padding-left:14px;vertical-align:top;font-size:13px;line-height:1.5;color:#334155;">
      <strong style="font-size:14px;color:#0f172a;">MedaGhar Support Team</strong><br>
      Pakistan's free property marketplace<br>
      <a href="mailto:info@medaghar.com" style="color:#0e7490;text-decoration:none;">info@medaghar.com</a> &nbsp;·&nbsp;
      <a href="${SITE}" style="color:#0e7490;text-decoration:none;">medaghar.com</a>
    </td>
  </tr>
</table>`

const P = (s: string) => `<p>${s}</p>`
const DEFAULT_TEMPLATES: { name: string; category: string; subject?: string; html: string }[] = [
  {
    name: 'General reply',
    category: 'General',
    html: [
      P('Assalam o Alaikum {{name}},'),
      P('Thank you for getting in touch with MedaGhar. [Your answer here.]'),
      P('If there is anything else we can help with, just reply to this email.'),
      P('Regards,'),
    ].join('\n'),
  },
  {
    name: 'Listing enquiry: property details',
    category: 'Listings',
    html: [
      P('Assalam o Alaikum {{name}},'),
      P('Thank you for your interest in this property. Here are the details you asked about:'),
      `<div class="panel">[Price, size, location and availability]</div>`,
      P('To arrange a visit, reply with a day and time that suits you, or call the owner directly using the number on the listing page.'),
      P('Regards,'),
    ].join('\n'),
  },
  {
    name: 'Your listing is live',
    category: 'Listings',
    subject: 'Your listing is now live on MedaGhar',
    html: [
      `<h2>Your listing is live</h2>`,
      P('Assalam o Alaikum {{name}},'),
      P('Your property is now published on MedaGhar and buyers can contact you directly. Listings with clear photos and a complete description get far more calls.'),
      `<p style="text-align:center;"><a class="cta" href="${SITE}/dashboard">View my listings</a></p>`,
      P('Regards,'),
    ].join('\n'),
  },
  {
    name: 'Photos needed',
    category: 'Listings',
    subject: 'Add photos to your MedaGhar listing',
    html: [
      P('Assalam o Alaikum {{name}},'),
      P('Your listing is almost ready, but it needs a few more photos before buyers can see it.'),
      `<div class="panel"><strong>What works best</strong><ul class="steps"><li>Front of the property in daylight</li><li>Lounge, kitchen and at least one bathroom</li><li>Landscape (sideways) photos, no people in shot</li></ul></div>`,
      P('You can add photos from your dashboard at any time.'),
      P('Regards,'),
    ].join('\n'),
  },
  {
    name: 'Account & sign-in help',
    category: 'Account',
    html: [
      P('Assalam o Alaikum {{name}},'),
      P('Sorry you are having trouble signing in. You can set a new password at any time here:'),
      `<p style="text-align:center;"><a class="cta" href="${SITE}/forgot-password">Reset my password</a></p>`,
      `<div class="warn">MedaGhar staff will never ask for your password. If someone does, please do not share it.</div>`,
      P('Regards,'),
    ].join('\n'),
  },
  {
    name: 'Agent / dealer partnership',
    category: 'Agents',
    subject: 'List your properties on MedaGhar for free',
    html: [
      P('Assalam o Alaikum {{name}},'),
      P('Thank you for your interest in working with MedaGhar. Agents and dealers can list properties for free, and buyer calls and WhatsApp messages go straight to your number.'),
      `<div class="card"><strong>Getting started</strong><ol class="steps"><li>Create a free account and choose Agent</li><li>Add your listings with photos</li><li>Share your listing links in your WhatsApp groups</li></ol></div>`,
      `<p style="text-align:center;"><a class="cta" href="${SITE}/signup">Create my agent account</a></p>`,
      P('Regards,'),
    ].join('\n'),
  },
  {
    name: 'Featured listing offer',
    category: 'Sales',
    subject: 'Get more calls with a Featured listing',
    html: [
      P('Assalam o Alaikum {{name}},'),
      P('Featured listings appear at the top of search results and on the home page, and usually get several times more enquiries.'),
      `<p style="text-align:center;"><a class="cta" href="${SITE}/pricing">See pricing</a></p>`,
      P('Reply to this email and we will set it up for you.'),
      P('Regards,'),
    ].join('\n'),
  },
]

export async function ensureMailDefaults() {
  const [sigs, tpls] = await Promise.all([prisma.emailSignature.count(), prisma.emailTemplate.count()])
  if (!sigs) {
    await prisma.emailSignature.create({ data: { name: 'MedaGhar Support Team', html: DEFAULT_SIGNATURE, isDefault: true } })
  }
  if (!tpls) {
    await prisma.emailTemplate.createMany({ data: DEFAULT_TEMPLATES.map((t, i) => ({ ...t, sortOrder: i })) })
  }
}
