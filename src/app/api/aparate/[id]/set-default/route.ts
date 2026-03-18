export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  // Dezactivează implicit pe toate, apoi setează cel selectat
  await prisma.aparatMasura.updateMany({ data: { isDefault: false } })
  await prisma.aparatMasura.update({
    where: { id: params.id },
    data: { isDefault: true },
  })

  return NextResponse.json({ success: true })
}
