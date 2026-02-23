import PocketBase from 'pocketbase'

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL ??
  process.env.POCKETBASE_URL ??
  'http://127.0.0.1:8090'

let clientPb: PocketBase | null = null

export function createServerPb() {
  const pb = new PocketBase(PB_URL)
  pb.autoCancellation(false)
  return pb
}

export function getPb(_persistSession = false) {
  // Never share auth state across server requests.
  if (typeof window === 'undefined') {
    return createServerPb()
  }

  if (clientPb) return clientPb

  clientPb = new PocketBase(PB_URL)
  clientPb.autoCancellation(false)

  return clientPb
}

export const getClientPb = getPb
