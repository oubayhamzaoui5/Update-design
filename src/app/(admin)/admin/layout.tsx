import type { ReactNode } from 'react'
import { Geist } from 'next/font/google'

import { OrderNotificationsListener } from '@/components/admin/order-notifications'
import Sidebar from '@/components/admin/sidebar'
import { requireAdmin } from '@/lib/auth'

const geist = Geist({ subsets: ['latin'] })

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAdmin()

  return (
    <div className={`${geist.className} flex h-screen overflow-hidden bg-background`}>
      <OrderNotificationsListener />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
