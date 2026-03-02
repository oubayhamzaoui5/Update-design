import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-100 px-4 py-16 text-foreground" aria-label="Pied de page">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight">UPDATE <span className="text-accent">DESIGN</span></h2>
            <p className="text-base leading-relaxed text-foreground/80">
              Des luminaires et objets decoratifs premium pour sublimer votre interieur avec elegance.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Boutique</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/boutique" className="text-foreground/80 transition-colors hover:text-accent">
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link
                  href="/boutique/categorie/panneau-mural-effet-marbre"
                  className="text-foreground/80 transition-colors hover:text-accent"
                >
                  Panneau Mural Effet Marbre
                </Link>
              </li>
              <li>
                <Link
                  href="/boutique/categorie/profile-mural-effet-bois-d-interieur"
                  className="text-foreground/80 transition-colors hover:text-accent"
                >
                  Profile Mural Effet Bois D'intérieur
                </Link>
              </li>
              <li>
                <Link
                  href="/boutique/categorie/profile-mural-effet-bois-d-exterieur"
                  className="text-foreground/80 transition-colors hover:text-accent"
                >
                  Profile Mural Effet Bois D'extérieur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Assistance</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#contact" className="text-foreground/80 transition-colors hover:text-accent">
                  Contactez-nous
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-foreground/80 transition-colors hover:text-accent">
                  Informations de livraison
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-foreground/80 transition-colors hover:text-accent">
                  Retours
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-foreground/80 transition-colors hover:text-accent">
                  Questions frequentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Entreprise</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#about" className="text-foreground/80 transition-colors hover:text-accent">
                  A propos
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-foreground/80 transition-colors hover:text-accent">
                  Politique de confidentialite
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-foreground/80 transition-colors hover:text-accent">
                  Conditions generales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-foreground/15 pt-8">
          <p className="text-center text-sm text-foreground/70">© 2026 UPDATE DESIGN. Tous droits reserves.</p>
        </div>
      </div>
    </footer>
  )
}
