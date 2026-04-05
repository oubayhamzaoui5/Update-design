import { getPb } from "@/lib/pb";
import type { ProductListItem } from "@/lib/services/product.service";

export async function getBestSellers(): Promise<ProductListItem[]> {
  const pb = getPb();

  const res = await pb.collection("products").getList(1, 8, {
    sort: "-created",
  });

  const pbUrl =
    process.env.NEXT_PUBLIC_PB_URL ??
    process.env.POCKETBASE_URL ??
    "http://127.0.0.1:8090";

  return res.items.map((r: any): ProductListItem => {
    const imageFiles: string[] = Array.isArray(r.images) ? r.images : [];
    return {
      id: r.id,
      slug: r.slug ?? "",
      sku: r.sku ?? "",
      name: r.name ?? "",
      price: Number(r.price ?? 0),
      promoPrice: r.promoPrice ?? null,
      isActive: Boolean(r.isActive),
      inView:
        r.inView === undefined || r.inView === null
          ? true
          : Boolean(r.inView),
      description: r.description ?? "",
      images: imageFiles,
      imageUrls: imageFiles.map(
        (img) => `${pbUrl}/api/files/products/${r.id}/${img}`
      ),
      currency: r.currency ?? "DT",
      categories: Array.isArray(r.categories)
        ? r.categories
        : r.category
          ? [r.category]
          : [],
      inStock: true,
      isNew: Boolean(r.isNew),
      isVariant: Boolean(r.isVariant),
      isParent: Boolean(r.isParent),
      variantKey: (r.variantKey && typeof r.variantKey === "object") ? r.variantKey : {},
      stock: Number(r.stock ?? 0),
    };
  });
}