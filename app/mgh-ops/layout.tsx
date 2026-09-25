import type { Metadata } from 'next'
import { OpsSidebar } from '@/components/mgh-ops/Sidebar'
import { OpsTopbar } from '@/components/mgh-ops/Topbar'
import { getAdminSession } from '@/lib/admin-session'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Ops — MedaGhar',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MghOpsLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    return <div className="min-h-screen bg-slate-100">{children}</div>
  }

  const [unreadContacts, pendingProps] = await Promise.all([
    prisma.contact.count({ where: { isRead: false } }).catch(() => 0),
    prisma.property
      .count({
        where: {
          OR: [{ status: 'PENDING' }, { isVerified: false }],
        },
      })
      .catch(() => 0),
  ])

  const badges = { contacts: unreadContacts, moderation: pendingProps }
  const name = session.email?.split('@')[0] || 'Admin'

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <OpsSidebar badges={badges} />
      <div className="flex min-w-0 flex-1 flex-col">
        <OpsTopbar
          name={name}
          email={session.email}
          role={session.role}
          contactsCount={badges.contacts}
        />
        <div className="min-w-0 flex-1 px-4 py-6 lg:px-6">{children}</div>
      </div>
    </div>
  )
}
