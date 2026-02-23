// components/navbar-with-categories.tsx
import { getPb } from "@/lib/pb"
import { Navbar } from "@/components/navbar"

type Category = {
  id: string
  name: string
  slug: string
  parent?: string | string[] | null
}

export default async function NavbarWithCategories() {
  const pb = getPb()

  const catRes = await pb.collection("categories").getFullList(200, {
    sort: "name",
  })

  const categories: Category[] = catRes.map((c: any) => ({
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? "",
    parent: c.parent ?? null,
  }))

  return <Navbar categories={categories} />
}
