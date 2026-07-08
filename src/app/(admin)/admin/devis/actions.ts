'use server'

import { revalidatePath } from 'next/cache'

import { getAdminPbForAction } from '@/lib/admin/actions'
import { assertPocketBaseId } from '@/lib/admin/validation'
import type { QuoteRequestStatus } from '@/types/quote-request.types'

const statuses: QuoteRequestStatus[] = ['new', 'contacted', 'quote_sent', 'won', 'lost']

function normalizeStatus(value: string): QuoteRequestStatus {
  if (statuses.includes(value as QuoteRequestStatus)) return value as QuoteRequestStatus
  throw new Error('Invalid quote request status')
}

export async function updateQuoteRequestAction(
  id: string,
  data: { status?: string; adminNotes?: string }
) {
  assertPocketBaseId(id, 'quote request id')

  const payload: Record<string, string> = {}
  if (data.status) payload.status = normalizeStatus(data.status)
  if (typeof data.adminNotes === 'string') payload.adminNotes = data.adminNotes.slice(0, 4000)

  const { pb } = await getAdminPbForAction()
  const updated = await pb.collection('quote_requests').update(id, payload, { requestKey: null })

  revalidatePath('/admin')
  revalidatePath('/admin/devis')

  return {
    ok: true,
    status: normalizeStatus(String(updated.status ?? payload.status ?? 'new')),
    adminNotes: String(updated.adminNotes ?? ''),
  }
}

export async function deleteQuoteRequestAction(id: string) {
  assertPocketBaseId(id, 'quote request id')

  const { pb } = await getAdminPbForAction()
  await pb.collection('quote_requests').delete(id, { requestKey: null })

  revalidatePath('/admin')
  revalidatePath('/admin/devis')

  return { ok: true }
}
