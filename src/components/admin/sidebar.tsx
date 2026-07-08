"use client"

import NavLink from "./nav-link"
import {
  LayoutDashboard,
  LogOut,
  Sliders,
  FileText,
  ShieldCheck,
  Settings,
  Layers,
  MessageSquareText,
  Home,
  ExternalLink,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.replace("/connexion")
      router.refresh()
    }
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#1C1A14]/8 bg-white md:flex">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-[#C4A23E]"
            style={{ background: "#1C1A14", fontFamily: "var(--font-display), Georgia, serif" }}
          >
            UD
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-bold tracking-tight text-[#1C1A14]">Update Design</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9486]">
              Espace admin
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B5AF9F]">
          Showroom
        </p>
        <NavLink href="/admin" icon={LayoutDashboard} label="Tableau de bord" />
        <NavLink href="/admin/devis" icon={MessageSquareText} label="Demandes devis" />
        <NavLink href="/admin/catalogue" icon={Layers} label="Catalogue" />

        <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B5AF9F]">
          Contenu
        </p>
        <NavLink href="/admin/contenu" icon={Home} label="Pages site" />
        <NavLink href="/admin/blog" icon={FileText} label="Blog" />
        <NavLink href="/admin/variables" icon={Sliders} label="Variables" />

        <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B5AF9F]">
          Système
        </p>
        <NavLink href="/admin/administrateurs" icon={ShieldCheck} label="Administrateurs" />
        <NavLink href="/admin/parametres" icon={Settings} label="Paramètres" />
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-[#1C1A14]/8 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#5A554A] transition-colors hover:bg-[#1C1A14]/[0.05] hover:text-[#1C1A14]"
        >
          <ExternalLink className="h-[17px] w-[17px] text-[#9A9486]" />
          Voir le site
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#C0392B]/[0.07]"
        >
          <LogOut className="h-[17px] w-[17px]" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
