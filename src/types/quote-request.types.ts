export type QuoteRequestStatus =
  | 'new'
  | 'contacted'
  | 'quote_sent'
  | 'won'
  | 'lost'

export type QuoteRequestItem = {
  id: string
  category: string
  type: 'Modele' | 'Texture' | 'Accessoire'
  name: string
  ref?: string
  image?: string
  quantity: number
}

export type QuoteRequestRecord = {
  id: string
  created: string
  updated: string
  name: string
  phone: string
  email?: string
  city?: string
  notes?: string
  items: QuoteRequestItem[]
  status: QuoteRequestStatus
  adminNotes?: string
  source?: string
}
