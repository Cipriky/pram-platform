import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const remindere = await prisma.reminder.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      locatie: { select: { id: true, denumire: true, client: { select: { id: true, denumire: true } } } },
      verificare: { select: { id: true, numar: true } },
    },
    orderBy: { dataTrigger: 'asc' },
    take: 50,
  })

  return NextResponse.json(remindere)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  const body = await req.json()
  const { tip, titlu, mesaj, dataTrigger, locatieId, verificareId } = body

  if (!tip || !titlu || !dataTrigger) {
    return NextResponse.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 })
  }

  const reminder = await prisma.reminder.create({
    data: { tip, titlu, mesaj, dataTrigger: new Date(dataTrigger), locatieId, verificareId },
  })

  return NextResponse.json(reminder, { status: 201 })
}
