import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { clientSchema } from '@/lib/validations/client'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status')

  const clienti = await prisma.client.findMany({
    where: {
      ...(search ? {
        OR: [
          { denumire: { contains: search, mode: 'insensitive' } },
          { cui: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      _count: { select: { locatii: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clienti)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'clients:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = clientSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  // Generăm cod unic
  const count = await prisma.client.count()
  const cod = `CLT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const client = await prisma.client.create({
    data: {
      cod,
      ...validation.data,
    },
  })

  // Log activitate
  await prisma.logActivitate.create({
    data: {
      userId: session.user.id,
      actiune: 'CREATE_CLIENT',
      entitate: 'Client',
      entitateId: client.id,
      detalii: JSON.stringify({ cod: client.cod, denumire: client.denumire }),
    },
  })

  return NextResponse.json(client, { status: 201 })
}
