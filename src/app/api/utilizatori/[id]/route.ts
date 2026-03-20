export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { hasPermission } from '@/lib/permissions'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'users:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const { status } = await req.json()
  if (!['ACTIV', 'INACTIV', 'SUSPENDAT'].includes(status)) {
    return NextResponse.json({ error: 'Status invalid' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status },
    select: { id: true, status: true, prenume: true, nume: true },
  })

  return NextResponse.json(user)
}
