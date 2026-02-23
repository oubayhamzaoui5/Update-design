import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/navbar'

export default function CommandesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-background to-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-border/70 bg-white/70 p-5 shadow-sm">
          <Skeleton className="h-8 w-56 bg-slate-200" />
          <Skeleton className="mt-2 h-4 w-80 bg-slate-200" />
        </div>

        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-slate-200" />
                  <Skeleton className="h-3 w-20 bg-slate-200" />
                </div>
              </div>
              <Skeleton className="my-4 h-px w-full bg-slate-200" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-lg bg-slate-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 bg-slate-200" />
                    <Skeleton className="h-3 w-28 bg-slate-200" />
                    <Skeleton className="h-3 w-16 bg-slate-200" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-lg bg-slate-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40 bg-slate-200" />
                    <Skeleton className="h-3 w-24 bg-slate-200" />
                    <Skeleton className="h-3 w-16 bg-slate-200" />
                  </div>
                </div>
              </div>
              <Skeleton className="my-4 h-px w-full bg-slate-200" />
              <Skeleton className="h-4 w-36 bg-slate-200" />
              <Skeleton className="mt-2 h-4 w-56 bg-slate-200" />
              <Skeleton className="mt-4 h-10 w-full rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
