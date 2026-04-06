import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/navbar'

const CREAM = '#FDFAF5'
const GOLD  = '#C4A23E'

export default function OrdersLoading() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <Navbar reserveSpace />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-8">
        <div className="mb-10">
          <Skeleton className="h-12 w-72" style={{ background: 'rgba(196,162,62,0.1)' }} />
          <Skeleton className="mt-3 h-4 w-56" style={{ background: 'rgba(196,162,62,0.07)' }} />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden bg-white"
              style={{ border: `1px solid rgba(196,162,62,0.15)` }}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid rgba(196,162,62,0.12)` }}
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10" style={{ background: 'rgba(196,162,62,0.1)', border: `1px solid rgba(196,162,62,0.2)` }} />
                  <div>
                    <Skeleton className="h-4 w-32" style={{ background: 'rgba(196,162,62,0.1)' }} />
                    <Skeleton className="mt-2 h-3 w-20" style={{ background: 'rgba(196,162,62,0.07)' }} />
                    <Skeleton className="mt-1 h-5 w-40" style={{ background: 'rgba(196,162,62,0.1)' }} />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-6 w-24" style={{ background: 'rgba(196,162,62,0.1)' }} />
                  <Skeleton className="mt-1 h-3 w-16" style={{ background: 'rgba(196,162,62,0.07)' }} />
                </div>
              </div>

              <div className="space-y-3 p-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16" style={{ background: 'rgba(196,162,62,0.08)', border: `1px solid rgba(196,162,62,0.12)` }} />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48" style={{ background: 'rgba(196,162,62,0.1)' }} />
                      <Skeleton className="mt-1 h-3 w-28" style={{ background: 'rgba(196,162,62,0.07)' }} />
                    </div>
                    <Skeleton className="h-4 w-20" style={{ background: 'rgba(196,162,62,0.1)' }} />
                  </div>
                ))}
              </div>

              <div
                className="flex items-center justify-between p-5"
                style={{ borderTop: `1px solid rgba(196,162,62,0.1)`, background: 'rgba(196,162,62,0.02)' }}
              >
                <div>
                  <Skeleton className="h-3 w-32" style={{ background: 'rgba(196,162,62,0.07)' }} />
                  <Skeleton className="mt-2 h-6 w-40" style={{ background: 'rgba(196,162,62,0.1)' }} />
                </div>
                <Skeleton className="h-11 w-52" style={{ background: 'rgba(196,162,62,0.1)', border: `1px solid rgba(196,162,62,0.2)` }} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
