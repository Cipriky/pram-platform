import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { locatieSchema } from '@/lib/validations/locatie'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const locatie = await prisma.locatie.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      verificari: {
        take: 10,
        orderBy: { dataProgramata: 'desc' },
        include: {
          tehnician: { select: { prenume: true, nume: true } },
        },
      },
      _count: { select: { verificari: true } },
    },
  })

  if (!locatie) return NextResponse.json({ error: 'Locație negăsită' }, { status: 404 })
  return NextResponse.json(locatie)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

  const locatie = await prisma.locatie.update({
    where: { id: params.id },
    data: validation.data,
  })

  return NextResponse.json(locatie)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'locations:delete')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const verificariCount = await prisma.verificare.count({ where: { locatieId: params.id } })
  if (verificariCount > 0) {
    return NextResponse.json(
      { error: `Nu se poate șterge. Există ${verificariCount} verificări asociate.` },
      { status: 400 }
    )
  }

  await prisma.locatie.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Locație ștearsă' })
}
