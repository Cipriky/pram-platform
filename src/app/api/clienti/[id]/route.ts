import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { clientSchema } from '@/lib/validations/client'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      locatii: true,
      contracte: true,
      _count: { select: { locatii: true } },
    },
  })

  if (!client) return NextResponse.json({ error: 'Client negăsit' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

  const client = await prisma.client.update({
    where: { id: params.id },
    data: validation.data,
  })

  await prisma.logActivitate.create({
    data: {
      userId: session.user.id,
      actiune: 'UPDATE_CLIENT',
      entitate: 'Client',
      entitateId: client.id,
    },
  })

  return NextResponse.json(client)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'clients:delete')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  // Verificăm dacă are locații asociate
  const locatiiCount = await prisma.locatie.count({ where: { clientId: params.id } })
  if (locatiiCount > 0) {
    return NextResponse.json(
      { error: `Nu se poate șterge clientul. Are ${locatiiCount} locații asociate.` },
      { status: 400 }
    )
  }

  await prisma.client.delete({ where: { id: params.id } })

  return NextResponse.json({ message: 'Client șters cu succes' })
}
