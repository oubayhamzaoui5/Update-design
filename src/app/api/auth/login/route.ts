import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import PocketBase from 'pocketbase'
import { z } from 'zod'

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL ??
  process.env.POCKETBASE_URL ??
  'http://127.0.0.1:8090'

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, password } = loginSchema.parse(body)
    const normalizedEmail = email.trim().toLowerCase()

    // Create new PB instance for this request
    const pb = new PocketBase(PB_URL)

    // Authenticate with PocketBase using the users collection
    const authData = await pb.collection('users').authWithPassword(normalizedEmail, password)

    if (!authData.record) {
      return NextResponse.json(
        { message: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (authData.record.isActive === false) {
      return NextResponse.json(
        { message: 'Ce compte est désactivé. Veuillez contacter le support.' },
        { status: 403 }
      )
    }

    const isHttpsRequest =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.nextUrl.protocol === 'https:' ||
      process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') === true

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    const authCookie = JSON.stringify({
      token: authData.token,
      record: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        username: authData.record.username,
        role: authData.record.role || 'user',
        isActive: authData.record.isActive !== false,
        verified: authData.record.verified || false,
        avatar: authData.record.avatar || undefined,
      },
    })

    cookieStore.set('pb_auth', authCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isHttpsRequest,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      token: authData.token,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        username: authData.record.username,
        role: authData.record.role || 'user',
        isActive: authData.record.isActive !== false,
        verified: authData.record.verified || false,
        avatar: authData.record.avatar || undefined,
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Requête invalide' },
        { status: 400 }
      )
    }

    if (error.status === 400) {
      return NextResponse.json(
        { message: 'Email ou mot de passe invalide' },
        { status: 401 }
      )
    }

    console.error('Login error:', error)

    return NextResponse.json(
      { message: "Une erreur est survenue pendant la connexion" },
      { status: 500 }
    )
  }
}
