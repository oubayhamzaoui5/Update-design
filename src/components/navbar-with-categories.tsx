// components/navbar-with-categories.tsx
import { getPb } from "@/lib/pb"
import { Navbar } from "@/components/navbar"

type Category = {
  id: string
  name: string
  slug: string
  order?: number
  parent?: string | string[] | null
}

export default async function NavbarWithCategories() {
  const pb = getPb()

  const catRes = await pb.collection("categories").getFullList(200, {
    sort: "order,name",
  })

  const categories: Category[] = catRes.map((c: any) => ({
    id: c.id,
    name: c.name ?? "",
    slug: c.slug ?? "",
    order: Number(c.order ?? 0),
    parent: c.parent ?? null,
  }))

  return <Navbar categories={categories} />
}
