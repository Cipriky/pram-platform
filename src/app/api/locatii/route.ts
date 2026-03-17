export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { locatieSchema } from '@/lib/validations/locatie'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const search = searchParams.get('search')

  const locatii = await prisma.locatie.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(search ? { denumire: { contains: search, mode: 'insensitive' } } : {}),
    },
    include: {
      client: { select: { id: true, denumire: true, cod: true } },
      _count: { select: { verificari: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(locatii)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'locations:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = locatieSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  const count = await prisma.locatie.count()
  const cod = `LOC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const locatie = await prisma.locatie.create({
    data: { cod, ...validation.data },
  })

  return NextResponse.json(locatie, { status: 201 })
}
