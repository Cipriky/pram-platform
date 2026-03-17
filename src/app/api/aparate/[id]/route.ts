export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { aparatMasuraSchema } from '@/lib/validations/aparat'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const aparat = await prisma.aparatMasura.findUnique({
    where: { id: params.id },
    include: {
      verificari: {
        include: {
          verificare: { include: { locatie: { include: { client: { select: { denumire: true } } } } } },
        },
        take: 10,
      },
    },
  })

  if (!aparat) return NextResponse.json({ error: 'Aparat negăsit' }, { status: 404 })
  return NextResponse.json(aparat)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'devices:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = aparatMasuraSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
  }

  const aparat = await prisma.aparatMasura.update({
    where: { id: params.id },
    data: {
      ...validation.data,
      dataAchizitie: validation.data.dataAchizitie ? new Date(validation.data.dataAchizitie) : null,
      dataUltimaEtalonare: validation.data.dataUltimaEtalonare ? new Date(validation.data.dataUltimaEtalonare) : null,
      dataUrmatoareEtalonare: validation.data.dataUrmatoareEtalonare ? new Date(validation.data.dataUrmatoareEtalonare) : null,
    },
  })

  return NextResponse.json(aparat)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'devices:delete')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  await prisma.aparatMasura.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Aparat șters' })
}
