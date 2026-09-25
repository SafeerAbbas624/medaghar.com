import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Panel({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('mb-5 rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          {title ? (
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-700">{title}</h2>
          ) : (
            <span />
          )}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function KpiTile({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: string | number
  hint?: string
  href?: string
}) {
  const inner = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
      >
        {inner}
      </Link>
    )
  }
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{inner}</div>
}

export function StubPage({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle="Coming in a later milestone" />
      <Panel>
        <p className="text-sm text-slate-600">
          {note ||
            'This screen is stubbed so the ops console navigation stays complete. Implementation lands in a later milestone.'}
        </p>
        <Link
          href="/mgh-ops/"
          className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to Dashboard Home
        </Link>
      </Panel>
    </div>
  )
}
