import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Update Design | Sign Up',
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SignUpRedirectPage({ searchParams }: Props) {
  const sp = await searchParams
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next
  const target = next ? `/inscription?next=${encodeURIComponent(next)}` : '/inscription'
  redirect(target)
}
