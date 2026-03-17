import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const lastYear = new Date(now.getFullYear() - 1, 0, 1)

  // Statistici generale
  const [
    totalVerificari,
    verificariFinalizate,
    verificariAcestAnRaw,
    clientiActivi,
    tehnicieni,
    topClientiRaw,
    peJudetRaw,
    peStatusRaw,
    peRezultatRaw,
    pelunaRaw,
  ] = await Promise.all([
    prisma.verificare.count(),
    prisma.verificare.count({ where: { status: 'FINALIZATA' } }),
    prisma.verificare.count({ where: { createdAt: { gte: startOfYear } } }),
    prisma.client.count({ where: { status: 'ACTIV' } }),
    prisma.user.count({ where: { role: 'TEHNICIAN', status: 'ACTIV' } }),

    // Top clienți după nr. verificări
    prisma.client.findMany({
      select: {
        id: true,
        denumire: true,
        cod: true,
        _count: { select: { locatii: true } },
        locatii: {
          select: {
            _count: { select: { verificari: true } },
          },
        },
      },
      take: 10,
    }),

    // Verificări pe județ
    prisma.locatie.groupBy({
      by: ['judet'],
      _count: { id: true },
      where: { verificari: { some: {} } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Pe status
    prisma.verificare.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    // Pe rezultat (finalizate)
    prisma.verificare.groupBy({
      by: ['rezultat'],
      _count: { id: true },
      where: { status: 'FINALIZATA', rezultat: { not: null } },
    }),

    // Pe lună (ultimele 12 luni)
    prisma.$queryRaw<{ luna: string; total: number }[]>`
      SELECT TO_CHAR("dataProgramata", 'YYYY-MM') as luna, COUNT(*) as total
      FROM verificari
      WHERE "dataProgramata" >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1)}
      GROUP BY luna
      ORDER BY luna ASC
    `,
  ])

  // Procesare top clienți
  const topClienti = topClientiRaw
    .map(c => ({
      id: c.id,
      denumire: c.denumire,
      cod: c.cod,
      locatii: c._count.locatii,
      verificari: c.locatii.reduce((sum: number, l: any) => sum + l._count.verificari, 0),
    }))
    .sort((a, b) => b.verificari - a.verificari)
    .slice(0, 8)

  // Conformitate
  const admise = peRezultatRaw.find(r => r.rezultat === 'ADMIS')?._count?.id ?? 0
  const admiseCuRezerve = peRezultatRaw.find(r => r.rezultat === 'ADMIS_CU_REZERVE')?._count?.id ?? 0
  const respinse = peRezultatRaw.find(r => r.rezultat === 'RESPINS')?._count?.id ?? 0
  const totalFinalizate = admise + admiseCuRezerve + respinse
  const conformitate = totalFinalizate > 0 ? Math.round(((admise + admiseCuRezerve) / totalFinalizate) * 100) : 0

  return NextResponse.json({
    general: {
      totalVerificari,
      verificariFinalizate,
      verificariAcestAn: verificariAcestAnRaw,
      clientiActivi,
      tehnicieni,
      conformitate,
    },
    topClienti,
    peJudet: peJudetRaw.map(j => ({ judet: j.judet, total: Number(j._count.id) })),
    peStatus: peStatusRaw.map(s => ({ status: s.status, total: Number(s._count.id) })),
    peRezultat: peRezultatRaw.map(r => ({ rezultat: r.rezultat, total: Number(r._count.id) })),
    peLuna: pelunaRaw.map(l => ({ luna: l.luna, total: Number(l.total) })),
  })
}
