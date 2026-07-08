"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

export default function NavLink({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string
  icon: LucideIcon
  label: string
  badge?: number
}) {
  const pathname = usePathname()
  const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-all outline-none ${
        isActive
          ? "bg-[#1C1A14] font-semibold text-white"
          : "font-medium text-[#5A554A] hover:bg-[#1C1A14]/[0.05] hover:text-[#1C1A14]"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#C4A23E]" />
      )}
      <div className="flex items-center gap-2.5">
        <Icon
          className={`h-[17px] w-[17px] shrink-0 transition-colors ${
            isActive ? "text-[#C4A23E]" : "text-[#9A9486] group-hover:text-[#1C1A14]"
          }`}
        />
        <span>{label}</span>
      </div>

      {badge !== undefined && badge > 0 && (
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
            isActive ? "bg-[#C4A23E] text-[#1C1A14]" : "bg-[#C4A23E] text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}
