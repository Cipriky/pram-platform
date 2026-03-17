import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const notificari = await prisma.notificare.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(notificari)
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  // Marchează toate ca citite
  await prisma.notificare.updateMany({
    where: { userId: session.user.id, citita: false },
    data: { citita: true },
  })

  return NextResponse.json({ message: 'Toate notificările au fost marcate ca citite.' })
}
