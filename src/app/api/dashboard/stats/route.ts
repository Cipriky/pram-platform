import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const now = new Date()
  const isTehnician = session.user.role === 'TEHNICIAN'

  const [
    totalClienti,
    totalLocatii,
    verificariLuna,
    programate,
    inDesfasurare,
    aparateAlerta,
  ] = await Promise.all([
    prisma.client.count({ where: { status: 'ACTIV' } }),
    prisma.locatie.count({ where: { status: 'ACTIVA' } }),
    prisma.verificare.count({
      where: {
        dataProgramata: { gte: startOfMonth(now), lte: endOfMonth(now) },
        ...(isTehnician ? { tehnicianId: session.user.id } : {}),
      },
    }),
    prisma.verificare.count({
      where: {
        status: 'PROGRAMATA',
        ...(isTehnician ? { tehnicianId: session.user.id } : {}),
      },
    }),
    prisma.verificare.count({
      where: {
        status: 'IN_DESFASURARE',
        ...(isTehnician ? { tehnicianId: session.user.id } : {}),
      },
    }),
    prisma.aparatMasura.count({
      where: {
        status: 'ACTIV',
        dataUrmatoareEtalonare: {
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  return NextResponse.json({
    totalClienti,
    totalLocatii,
    verificariLuna,
    programate,
    inDesfasurare,
    aparateAlerta,
  })
}
