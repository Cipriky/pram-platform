import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  const body = await req.json()
  const reminder = await prisma.reminder.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(reminder)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  await prisma.reminder.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Șters' })
}
