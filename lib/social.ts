/**
 * Social presence, in one place.
 *
 * The footer and the Organization schema both read from here. They had been
 * disagreeing — the footer linked six profiles while the schema claimed none
 * — and worse, none of those six accounts existed. The links went to whatever
 * happened to sit on the `medaghar` handle on each platform, and the footer
 * also carried a WhatsApp link to `wa.me/923000000000`, sending anyone who
 * clicked it to an arbitrary phone number.
 *
 * `live` gates both the footer link and the `sameAs` entry. It is false until
 * an account genuinely exists and is controlled by MedaGhar, because `sameAs`
 * is a claim of ownership: naming a handle somebody else holds tells Google
 * their account represents this business.
 *
 * To switch one on: create the account, set `live: true`, and correct the
 * href if the handle differs.
 */

export interface SocialProfile {
  label: string
  href: string
  /** Account exists and is ours. Gates the footer link and Organization.sameAs. */
  live: boolean
  /** react-icons name, resolved by the rendering component. */
  icon: string
}

export const SOCIAL_PROFILES: SocialProfile[] = [
  // facebook.com rather than web.facebook.com: the latter is the desktop-only
  // host and redirects on mobile, which is not what you want in sameAs.
  { label: 'Facebook', href: 'https://www.facebook.com/medaghar', live: true, icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/medaghar_com/', live: true, icon: 'instagram' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@medaghar.com', live: true, icon: 'tiktok' },
  { label: 'YouTube', href: 'https://www.youtube.com/@medaghar-com', live: true, icon: 'youtube' },
  { label: 'X (Twitter)', href: 'https://x.com/medaghar', live: true, icon: 'twitter' },
  // No LinkedIn page yet.
  { label: 'LinkedIn', href: 'https://linkedin.com/company/medaghar', live: false, icon: 'linkedin' },
]

/** Profiles to show and to advertise. Empty until accounts are created. */
export function liveProfiles(): SocialProfile[] {
  return SOCIAL_PROFILES.filter((p) => p.live)
}

/** URLs for Organization.sameAs. */
export function sameAsUrls(): string[] {
  return liveProfiles().map((p) => p.href)
}

/**
 * Business WhatsApp number in international format, digits only
 * (e.g. 923001234567). Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable. Empty
 * hides every WhatsApp call-to-action rather than linking to a dead chat.
 */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export function whatsappHref(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
