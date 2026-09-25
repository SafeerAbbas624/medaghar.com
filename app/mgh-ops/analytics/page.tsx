'use client'

import { PageHeader, Panel } from '@/components/mgh-ops/ui'
import TrafficAnalyticsTab from '@/components/admin/TrafficAnalyticsTab'

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Traffic and engagement" />
      <Panel bodyClassName="p-0 sm:p-2">
        <TrafficAnalyticsTab />
      </Panel>
    </div>
  )
}
