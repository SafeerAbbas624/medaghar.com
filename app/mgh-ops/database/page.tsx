'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import DatabaseManagementTab from '@/components/admin/DatabaseManagementTab'
import ListingImportPanel from '@/components/admin/ListingImportPanel'

export default function DatabasePage() {
  return (
    <div>
      <PageHeader title="Database" subtitle="Tables and maintenance tools" />
      <Panel title="Import listings (CSV)">
        <ListingImportPanel />
      </Panel>
      <Panel bodyClassName="p-0 sm:p-2">
        <DatabaseManagementTab />
      </Panel>
    </div>
  )
}
