import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { z } from 'zod'

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL ??
  process.env.POCKETBASE_URL ??
  'http://127.0.0.1:8090'

const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  passwordConfirm: z.string(),
  surname: z.string().min(2, 'Le prenom doit contenir au moins 2 caracteres'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ["passwordConfirm"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const data = registerSchema.parse(body)

    // Create new PB instance
    const pb = new PocketBase(PB_URL)

    // Create user in PocketBase
    const record = await pb.collection('users').create({
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      surname: data.surname,
      name: data.name,
      username: data.username,
      role: 'user', // Default role
      isActive: true,
      emailVisibility: true,
    })

    // Optionally send verification email
    try {
      await pb.collection('users').requestVerification(data.email)
    } catch (e) {
      console.error('Failed to send verification email:', e)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
      user: {
        id: record.id,
        email: record.email,
        surname: record.surname,
        name: record.name,
        username: record.username,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    // Handle PocketBase validation errors
    if (error.status === 400 && error.data?.data) {
      const pbErrors = error.data.data
      const errorMessages: string[] = []
      
      Object.keys(pbErrors).forEach((field) => {
        const fieldError = pbErrors[field]
        if (fieldError.message) {
          errorMessages.push(`${field}: ${fieldError.message}`)
        }
      })
      
      return NextResponse.json(
        { message: errorMessages.join(', ') || 'Validation échouée' },
        { status: 400 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Requête invalide' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Échec de l’inscription. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
