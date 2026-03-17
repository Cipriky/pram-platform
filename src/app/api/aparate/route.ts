export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { aparatMasuraSchema } from '@/lib/validations/aparat'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const aparate = await prisma.aparatMasura.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(aparate)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'devices:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = aparatMasuraSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  const count = await prisma.aparatMasura.count()
  const cod = `APM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const aparat = await prisma.aparatMasura.create({
    data: {
      cod,
      ...validation.data,
      dataAchizitie: validation.data.dataAchizitie ? new Date(validation.data.dataAchizitie) : null,
      dataUltimaEtalonare: validation.data.dataUltimaEtalonare ? new Date(validation.data.dataUltimaEtalonare) : null,
      dataUrmatoareEtalonare: validation.data.dataUrmatoareEtalonare ? new Date(validation.data.dataUrmatoareEtalonare) : null,
    },
  })

  // Creem reminder pentru etalonare dacă avem dată
  if (aparat.dataUrmatoareEtalonare) {
    const reminderDate = new Date(aparat.dataUrmatoareEtalonare)
    reminderDate.setDate(reminderDate.getDate() - 30)
    await prisma.reminder.create({
      data: {
        tip: 'ETALONARE_APARAT',
        titlu: `Etalonare ${aparat.denumire} (${aparat.cod})`,
        mesaj: `Aparatul ${aparat.producator} ${aparat.model} (${aparat.serieNumar}) necesită etalonare pe ${aparat.dataUrmatoareEtalonare.toLocaleDateString('ro-RO')}.`,
        dataTrigger: reminderDate,
      },
    })
  }

  return NextResponse.json(aparat, { status: 201 })
}
