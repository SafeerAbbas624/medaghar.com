'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import EmailManagementTab from '@/components/admin/EmailManagementTab'

export default function EmailPage() {
  return (
    <div>
      <PageHeader title="Email" subtitle="Company mailbox — read and send" />
      <Panel bodyClassName="p-0 sm:p-2">
        <EmailManagementTab />
      </Panel>
    </div>
  )
}
