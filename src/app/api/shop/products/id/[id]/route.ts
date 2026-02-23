import { NextRequest, NextResponse } from "next/server"
import { createServerPb } from "@/lib/pb"

function normalizeProduct(record: any) {
  return {
    id: String(record?.id ?? ""),
    slug: String(record?.slug ?? ""),
    name: String(record?.name ?? ""),
    sku: String(record?.sku ?? ""),
    images: Array.isArray(record?.images) ? record.images.map(String) : [],
    price: typeof record?.price === "number" ? record.price : Number(record?.price ?? 0),
    promoPrice:
      record?.promoPrice == null || !Number.isFinite(Number(record?.promoPrice))
        ? null
        : Number(record.promoPrice),
    currency: String(record?.currency ?? "DT"),
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const safeId = String(id ?? "").trim()
    if (!/^[a-zA-Z0-9]{15}$/.test(safeId)) {
      return NextResponse.json({ error: "productId invalide" }, { status: 400 })
    }

    const pb = createServerPb()
    const record = await pb.collection("products").getOne(safeId, {
      fields: "id,slug,name,sku,images,price,promoPrice,currency,isActive,inView",
      requestKey: null,
    })

    if (record.isActive === false || record.inView === false) {
      return NextResponse.json({ error: "Produit indisponible" }, { status: 404 })
    }

    return NextResponse.json({ product: normalizeProduct(record) }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
  }
}
