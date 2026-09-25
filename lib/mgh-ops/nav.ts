/**
 * MedaGhar ops console information architecture.
 * Paths live under /mgh-ops (decoy /admin left in place).
 */

export interface NavLink {
  id: string
  label: string
  href: string
  icon: string
  badge?: 'contacts' | 'moderation'
  isNew?: boolean
  stub?: boolean
}

export interface NavGroup {
  group: string
  items: (NavLink | { subgroup: string; items: NavLink[] })[]
}

export type NavEntry = NavLink | NavGroup

export const ADMIN_NAV: NavEntry[] = [
  {
    id: 'overview',
    label: 'Dashboard Home',
    href: '/mgh-ops/',
    icon: 'FaTachometerAlt',
  },
  {
    group: 'Marketplace',
    items: [
      { id: 'listings', label: 'Listings', href: '/mgh-ops/listings/', icon: 'FaHome' },
      { id: 'featured', label: 'Featured', href: '/mgh-ops/featured/', icon: 'FaStar', stub: true },
      {
        id: 'moderation',
        label: 'Moderation',
        href: '/mgh-ops/moderation/',
        icon: 'FaClipboardCheck',
        badge: 'moderation',
        stub: true,
      },
      { id: 'scraper', label: 'Competitor Scraper', href: '/mgh-ops/scraper/', icon: 'FaSpider', isNew: true },
    ],
  },
  {
    group: 'People',
    items: [
      { id: 'users', label: 'Users', href: '/mgh-ops/users/', icon: 'FaUsers' },
      { id: 'agents', label: 'Agents', href: '/mgh-ops/agents/', icon: 'FaUserTie', stub: true },
      { id: 'admins', label: 'Admin Users', href: '/mgh-ops/admins/', icon: 'FaUserShield' },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { id: 'analytics', label: 'Analytics', href: '/mgh-ops/analytics/', icon: 'FaChartLine' },
      {
        id: 'visitors',
        label: 'Visitors & IP',
        href: '/mgh-ops/visitors/',
        icon: 'FaRadar',
        stub: true,
        isNew: true,
      },
      {
        id: 'engagement',
        label: 'Engagement',
        href: '/mgh-ops/engagement/',
        icon: 'FaMousePointer',
        stub: true,
      },
      {
        subgroup: 'Email Marketing',
        items: [
          {
            id: 'newsletter-create',
            label: 'Create Newsletter',
            href: '/mgh-ops/newsletter/',
            icon: 'FaPen',
            stub: true,
          },
          {
            id: 'newsletter-analytics',
            label: 'Newsletter Analytics',
            href: '/mgh-ops/newsletter/analytics/',
            icon: 'FaChartBar',
            stub: true,
          },
        ],
      },
    ],
  },
  {
    group: 'Inbox',
    items: [
      {
        id: 'contacts',
        label: 'Contacts / Leads',
        href: '/mgh-ops/contacts/',
        icon: 'FaComments',
        badge: 'contacts',
      },
      { id: 'email', label: 'Email', href: '/mgh-ops/email/', icon: 'FaEnvelope' },
    ],
  },
  {
    group: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/mgh-ops/settings/',
        icon: 'FaCog',
        stub: true,
      },
      {
        id: 'audit',
        label: 'Audit Trail',
        href: '/mgh-ops/settings/audit/',
        icon: 'FaHistory',
        stub: true,
      },
      { id: 'database', label: 'Database', href: '/mgh-ops/database/', icon: 'FaDatabase' },
    ],
  },
]

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'group' in entry
}

export function allNavLinks(): NavLink[] {
  const out: NavLink[] = []
  for (const entry of ADMIN_NAV) {
    if (isNavGroup(entry)) {
      for (const item of entry.items) {
        if ('subgroup' in item) out.push(...item.items)
        else out.push(item)
      }
    } else out.push(entry)
  }
  return out
}

export function findNavLink(pathname: string): NavLink | null {
  const links = allNavLinks()
  const normalized = pathname.endsWith('/') || pathname === '/mgh-ops' ? pathname : `${pathname}/`
  const exact = links.find((l) => l.href === normalized || l.href === pathname)
  if (exact) return exact
  return (
    links
      .filter((l) => l.href !== '/mgh-ops/' && (pathname.startsWith(l.href) || normalized.startsWith(l.href)))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? null
  )
}
