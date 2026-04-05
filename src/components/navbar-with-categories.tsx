// components/navbar-with-categories.tsx
import { Navbar } from "@/components/navbar"
import { getShopCategories } from "@/lib/services/product.service"
import type { NavCategory } from "@/components/mega-menu"

export default async function NavbarWithCategories() {
  const catRes = await getShopCategories()

  const categories: NavCategory[] = catRes.map((c) => ({
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? "",
    order: Number(c.order ?? 0),
    parent: c.parent ?? null,
    description: c.description ?? null,
    menuImageUrl: c.menuImageUrl ?? null,
    coverImageUrl: c.coverImageUrl ?? null,
  }))

  return <Navbar categories={categories} />
}
