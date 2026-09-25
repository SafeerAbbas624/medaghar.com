'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import AdminUserManagementTab from '@/components/admin/AdminUserManagementTab'

export default function AdminsPage() {
  return (
    <div>
      <PageHeader title="Admin Users" subtitle="Ops console accounts and roles" />
      <Panel bodyClassName="p-0 sm:p-2">
        <AdminUserManagementTab />
      </Panel>
    </div>
  )
}
