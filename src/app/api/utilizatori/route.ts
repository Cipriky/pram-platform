import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { hasPermission } from '@/lib/permissions'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nume: z.string().min(1),
  prenume: z.string().min(1),
  telefon: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TEHNICIAN', 'BACK_OFFICE', 'CLIENT']),
})

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'users:read')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  const utilizatori = await prisma.user.findMany({
    where: role ? { role: role as any } : {},
    select: {
      id: true,
      email: true,
      nume: true,
      prenume: true,
      telefon: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(utilizatori)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'users:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = createUserSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email: validation.data.email } })
  if (existingUser) {
    return NextResponse.json({ error: 'Există deja un cont cu acest email.' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(validation.data.password, 12)

  const user = await prisma.user.create({
    data: {
      ...validation.data,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      nume: true,
      prenume: true,
      role: true,
      status: true,
    },
  })

  return NextResponse.json(user, { status: 201 })
}
