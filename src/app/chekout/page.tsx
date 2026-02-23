// app/chekout/page.tsx
import type { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { CheckoutContent } from "@/components/checkout-content"

export const metadata: Metadata = {
  title: "Update Design | Paiement",
}

export default function ChekoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<div className="p-6 text-sm text-foreground/70">Chargement...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
