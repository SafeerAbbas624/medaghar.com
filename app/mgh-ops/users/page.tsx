'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import UserManagementTab from '@/components/admin/UserManagementTab'

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="Users" subtitle="Site user accounts" />
      <Panel bodyClassName="p-0 sm:p-2">
        <UserManagementTab />
      </Panel>
    </div>
  )
}
