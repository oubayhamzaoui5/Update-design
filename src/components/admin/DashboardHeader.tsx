'use client'

import { OrderNotificationsControl } from '@/components/admin/order-notifications'

type DashboardHeaderProps = {
  name: string
}

export default function DashboardHeader({ name }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="mb-2 text-4xl font-bold text-blue-600">Bonjour, {name} !</h1>
        <p className="text-lg text-slate-600">Voici les indicateurs cles de votre boutique aujourd'hui.</p>
      </div>
      <div className="w-full max-w-md">
        <OrderNotificationsControl />
      </div>
    </div>
  )
}
