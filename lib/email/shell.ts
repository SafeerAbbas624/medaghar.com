/**
 * Shared shell for every MedaGhar email.
 *
 * The verification and welcome emails had drifted into two different designs
 * and two different voices — one full of exclamation marks and emoji, the
 * other measured — and both greeted the reader with "Welcome", so a new user
 * got the same greeting twice in five minutes.
 *
 * Everything is inline or in a single <style> block with table-free layout:
 * a max-width wrapper on a grey background is about as far as email clients
 * can be trusted to follow. No emoji — Outlook on Windows still renders some
 * of them as empty boxes, and a hollow rectangle in a security notice reads
 * as a broken email.
 */

export const SITE = 'https://medaghar.com'

const STYLES = `
  body { margin:0; padding:0; background-color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; background:#ffffff; }
  .header { background-color:#0e7490; padding:32px 24px; text-align:center; }
  .logo-img { width:64px; height:64px; object-fit:contain; }
  .logo-text { color:#ffffff; font-size:26px; font-weight:700; margin:8px 0 0; }
  .body { padding:32px 24px; color:#334155; font-size:15px; line-height:1.65; }
  h2 { color:#0f172a; font-size:21px; margin:0 0 16px; }
  a { color:#0e7490; }
  .cta { display:inline-block; background-color:#0e7490; color:#ffffff !important; text-decoration:none; padding:13px 34px; border-radius:10px; font-weight:600; margin:8px 0; }
  .panel { background:#ecfeff; border:1px solid #a5f3fc; border-radius:10px; padding:16px 20px; margin:21px 0; }
  .warn { background:#fffbeb; border-left:4px solid #f59e0b; border-radius:4px; padding:14px 18px; margin:21px 0; font-size:14px; color:#92400e; }
  .code { background:#ecfeff; border:2px solid #0e7490; border-radius:12px; padding:24px; text-align:center; margin:24px 0; }
  .code-label { font-size:13px; color:#0e7490; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
  .code-value { font-size:38px; font-weight:700; color:#0e7490; letter-spacing:8px; font-family:'Courier New',monospace; margin:12px 0 8px; }
  .muted { font-size:13px; color:#64748b; }
  .steps { padding-left:20px; margin:8px 0; }
  .steps li { margin-bottom:8px; }
  .card { border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; margin:21px 0; }
  .footer { background:#f9fafb; padding:24px; text-align:center; color:#64748b; font-size:13px; }
  .footer a { color:#0e7490; text-decoration:none; }
`

/** Wrap body content in the standard header, shell and footer. */
export function layout(title: string, content: string, footerNote?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>${STYLES}</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <img src="${SITE}/logo.png" alt="MedaGhar" class="logo-img" />
      <h1 class="logo-text">MedaGhar</h1>
    </div>

    <div class="body">
${content}
    </div>

    <div class="footer">
      <p style="margin:0 0 8px;"><strong>MedaGhar</strong> — Pakistan's free property marketplace</p>
      <p style="margin:0 0 8px;">
        <a href="mailto:info@medaghar.com">info@medaghar.com</a> &nbsp;·&nbsp;
        <a href="${SITE}">medaghar.com</a>
      </p>
      ${footerNote ? `<p style="margin:8px 0 0; font-size:12px; color:#94a3b8;">${footerNote}</p>` : ''}
    </div>
  </div>
</body>
</html>`
}

/** Plain-text footer, matching the HTML one. */
export function textFooter(): string {
  return `\n---\nMedaGhar — Pakistan's free property marketplace\ninfo@medaghar.com | ${SITE}`
}

/** Escape user-supplied text before it goes into an HTML email. */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Format a PKR amount the way Pakistanis read it. Duplicated from lib/format
 *  deliberately: email templates must not pull client-side modules. */
export function pkr(price: number, forRent = false): string {
  if (forRent) return `PKR ${price.toLocaleString()}/month`
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`
  return `PKR ${price.toLocaleString()}`
}
