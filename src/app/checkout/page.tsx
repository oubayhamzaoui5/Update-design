// app/checkout/page.tsx
import type { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { CheckoutContent } from "@/components/checkout-content"

export const metadata: Metadata = {
  title: "Commande | Update Design",
}

export default function CommandePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense
          fallback={
            <div
              className="flex min-h-screen items-center justify-center"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(28,26,20,0.4)',
                background: '#FDFAF5',
              }}
            >
              Loading...
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
