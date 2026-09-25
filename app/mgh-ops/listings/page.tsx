'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import ListingsManagementTab from '@/components/admin/ListingsManagementTab'

export default function ListingsPage() {
  return (
    <div>
      <PageHeader title="Listings" subtitle="Featured and verified property controls" />
      <Panel bodyClassName="p-0 sm:p-2">
        <ListingsManagementTab />
      </Panel>
    </div>
  )
}
