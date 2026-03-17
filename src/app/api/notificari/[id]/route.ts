export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const notif = await prisma.notificare.findUnique({ where: { id: params.id } })
  if (!notif || notif.userId !== session.user.id) {
    return NextResponse.json({ error: 'Nu există' }, { status: 404 })
  }

  const updated = await prisma.notificare.update({
    where: { id: params.id },
    data: { citita: !notif.citita },
  })

  return NextResponse.json(updated)
}
