export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const verificare = await prisma.verificare.findUnique({ where: { id: params.id } })
  if (!verificare) return NextResponse.json({ error: 'Verificare negăsită' }, { status: 404 })

  if (session.user.role === 'TEHNICIAN' && verificare.tehnicianId !== session.user.id) {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await req.json()
  const { denumire, nrPrize230V, nrPrize400V, nrTabUtilaj, corespunde } = body

  if (!denumire || typeof denumire !== 'string' || denumire.trim() === '') {
    return NextResponse.json({ error: 'Denumirea este obligatorie' }, { status: 400 })
  }

  const item = await prisma.continuitateAnexa.create({
    data: {
      verificareId: params.id,
      denumire: denumire.trim(),
      nrPrize230V: nrPrize230V != null ? Number(nrPrize230V) : null,
      nrPrize400V: nrPrize400V != null ? Number(nrPrize400V) : null,
      nrTabUtilaj: nrTabUtilaj?.trim() || null,
      corespunde: Boolean(corespunde),
    },
  })

  return NextResponse.json(item, { status: 201 })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const body = await req.json()
  const { itemId, denumire, nrPrize230V, nrPrize400V, nrTabUtilaj, corespunde } = body

  if (!itemId) return NextResponse.json({ error: 'ID lipsă' }, { status: 400 })
  if (!denumire?.trim()) return NextResponse.json({ error: 'Denumirea este obligatorie' }, { status: 400 })

  const updated = await prisma.continuitateAnexa.update({
    where: { id: itemId },
    data: {
      denumire: denumire.trim(),
      nrPrize230V: nrPrize230V != null ? Number(nrPrize230V) : null,
      nrPrize400V: nrPrize400V != null ? Number(nrPrize400V) : null,
      nrTabUtilaj: nrTabUtilaj?.trim() || null,
      corespunde: Boolean(corespunde),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'ID lipsă' }, { status: 400 })

  await prisma.continuitateAnexa.delete({ where: { id: itemId } })
  return NextResponse.json({ message: 'Șters' })
}
