import { getAdminQuoteRequests } from '@/lib/admin/data'

import QuoteRequestsClient from './quote-requests.client'

export const dynamic = 'force-dynamic'

export default async function AdminQuoteRequestsPage() {
  const initialRequests = await getAdminQuoteRequests()
  return <QuoteRequestsClient initialRequests={initialRequests} />
}
