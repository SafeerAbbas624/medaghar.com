'use client'

import dynamic from 'next/dynamic'

// Load after initial paint — only renders when items are in compare list
const CompareBar = dynamic(() => import('./CompareBar'), { ssr: false })

export default function DeferredCompareBar() {
  return <CompareBar />
}
