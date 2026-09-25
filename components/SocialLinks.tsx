import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { liveProfiles, whatsappHref } from '@/lib/social'

const ICONS: Record<string, IconType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
}

interface Props {
  /** `dark` for the footer, `light` for a white card. */
  variant?: 'dark' | 'light'
  /** Include a WhatsApp link when a business number is configured. */
  includeWhatsapp?: boolean
  className?: string
}

/**
 * The social icon row.
 *
 * One component for every place these appear. The footer and the contact page
 * had each hardcoded their own list and they disagreed: the footer pointed at
 * six accounts that did not exist, while contact linked to facebook.com and
 * twitter.com — the platform homepages, not profiles at all.
 *
 * Renders nothing when no account is live, so the surrounding heading can be
 * hidden too rather than sitting above an empty row.
 */
export default function SocialLinks({
  variant = 'dark',
  includeWhatsapp = false,
  className = '',
}: Props) {
  const profiles = liveProfiles()
  const whatsapp = includeWhatsapp
    ? whatsappHref('Hi MedaGhar, I have a question about a property.')
    : null

  if (profiles.length === 0 && !whatsapp) return null

  const style =
    variant === 'dark'
      ? 'bg-white/10 w-[42px] h-[42px] hover:bg-cyan-700 text-current'
      : 'bg-cyan-100 w-[55px] h-[55px] text-cyan-800 hover:bg-cyan-700 hover:text-white'

  return (
    <div className={`flex flex-wrap gap-[13px] ${className}`}>
      {profiles.map((p) => {
        const Icon = ICONS[p.icon]
        return (
          <a
            key={p.label}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`MedaGhar on ${p.label}`}
            title={p.label}
            className={`${style} rounded-full flex items-center justify-center transition`}
          >
            <Icon className={variant === 'dark' ? 'text-xl' : 'text-[21px]'} />
          </a>
        )
      })}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="MedaGhar on WhatsApp"
          title="WhatsApp"
          className={`${style} rounded-full flex items-center justify-center transition`}
        >
          <FaWhatsapp className={variant === 'dark' ? 'text-xl' : 'text-[21px]'} />
        </a>
      )}
    </div>
  )
}

/** Whether anything would render, for hiding surrounding headings. */
export function hasSocialLinks(includeWhatsapp = false): boolean {
  return liveProfiles().length > 0 || (includeWhatsapp && whatsappHref('x') !== null)
}
