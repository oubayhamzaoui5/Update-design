import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createServerPb } from '@/lib/pb'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

const itemSchema = z.object({
  id: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(120),
  type: z.enum(['Modele', 'Texture', 'Accessoire']),
  name: z.string().trim().min(1).max(180),
  ref: z.string().trim().max(80).optional(),
  image: z.string().trim().max(500).optional(),
  quantity: z.coerce.number().int().min(1).max(999),
})

const quoteRequestSchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(6, 'Le telephone est obligatoire').max(80),
  email: z.string().trim().email('Email invalide').max(160).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(3000).optional(),
  items: z.array(itemSchema).min(1, 'Ajoutez au moins une reference au devis.').max(80),
})

async function getSuperuserPb() {
  const email = process.env.PB_ADMIN_EMAIL ?? ''
  const password = process.env.PB_ADMIN_PASSWORD ?? ''

  if (!email || !password) {
    throw new Error('PocketBase admin credentials missing')
  }

  const pb = createServerPb()
  await pb.collection('_superusers').authWithPassword(email, password)
  return pb
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed } = await rateLimit(`quote-request:${ip}`, 6, 15 * 60 * 1000)

  if (!allowed) {
    return NextResponse.json(
      { message: 'Trop de demandes. Reessayez dans quelques minutes.' },
      { status: 429 }
    )
  }

  try {
    const payload = quoteRequestSchema.parse(await request.json())
    const pb = await getSuperuserPb()
    const record = await pb.collection('quote_requests').create(
      {
        name: payload.name ?? '',
        phone: payload.phone,
        email: payload.email || '',
        city: payload.city ?? '',
        notes: payload.notes ?? '',
        items: payload.items,
        status: 'new',
        adminNotes: '',
        source: 'website',
      },
      { requestKey: null }
    )

    return NextResponse.json({ id: record.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Demande invalide' },
        { status: 400 }
      )
    }

    console.error('[quote-requests:create]', error)
    return NextResponse.json(
      { message: 'Impossible d enregistrer la demande pour le moment.' },
      { status: 500 }
    )
  }
}
