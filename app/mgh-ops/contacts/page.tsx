'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import ContactSubmissionsTab from '@/components/admin/ContactSubmissionsTab'

export default function ContactsPage() {
  return (
    <div>
      <PageHeader title="Contacts / Leads" subtitle="Inbox from the contact form" />
      <Panel bodyClassName="p-0 sm:p-2">
        <ContactSubmissionsTab />
      </Panel>
    </div>
  )
}
