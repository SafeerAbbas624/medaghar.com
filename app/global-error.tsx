'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f8fafc', margin: 0 }}>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <h1 style={{ fontSize: 34, color: '#0f172a', marginBottom: 21 }}>MedaGhar is having trouble</h1>
            <p style={{ fontSize: 16, color: '#475569', marginBottom: 34 }}>
              Please refresh the page or try again in a few minutes.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{ background: '#0891b2', color: '#fff', border: 0, borderRadius: 8, padding: '13px 34px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
