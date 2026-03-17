import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { verificareSchema } from '@/lib/validations/verificare'
import { hasPermission } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const tehnicianId = searchParams.get('tehnicianId')
  const locatieId = searchParams.get('locatieId')
  const clientId = searchParams.get('clientId')

  const verificari = await prisma.verificare.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(tehnicianId ? { tehnicianId } : {}),
      ...(locatieId ? { locatieId } : {}),
      ...(clientId ? { locatie: { clientId } } : {}),
      // Tehnicianul vede doar verificările lui
      ...(session.user.role === 'TEHNICIAN' ? { tehnicianId: session.user.id } : {}),
    },
    include: {
      locatie: {
        include: {
          client: { select: { id: true, denumire: true, cod: true } },
        },
      },
      tehnician: { select: { id: true, prenume: true, nume: true, email: true } },
      _count: { select: { masuratori: true, poze: true } },
    },
    orderBy: { dataProgramata: 'desc' },
  })

  return NextResponse.json(verificari)
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'verifications:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = verificareSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  const count = await prisma.verificare.count()
  const numar = `VRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const verificare = await prisma.verificare.create({
    data: {
      numar,
      tip: validation.data.tip,
      locatieId: validation.data.locatieId,
      tehnicianId: validation.data.tehnicianId ?? null,
      creatDe: session.user.id,
      dataProgramata: new Date(validation.data.dataProgramata),
      durataPlanificata: validation.data.durataPlanificata ?? null,
      observatiiProgramare: validation.data.observatiiProgramare ?? null,
    },
    include: {
      locatie: { include: { client: true } },
      tehnician: { select: { prenume: true, nume: true, email: true } },
    },
  })

  // Creăm reminder pentru verificare viitoare (la 1 an)
  await prisma.reminder.create({
    data: {
      tip: 'VERIFICARE_PERIODICA',
      titlu: `Verificare periodică - ${verificare.locatie.denumire}`,
      mesaj: `Locația ${verificare.locatie.denumire} necesită verificare periodică.`,
      dataTrigger: new Date(new Date(validation.data.dataProgramata).getTime() + 365 * 24 * 60 * 60 * 1000),
      locatieId: validation.data.locatieId,
      verificareId: verificare.id,
    },
  })

  // Notificare pentru tehnician
  if (verificare.tehnicianId) {
    await prisma.notificare.create({
      data: {
        userId: verificare.tehnicianId,
        tip: 'VERIFICARE_PROGRAMATA',
        titlu: 'Verificare nouă atribuită',
        mesaj: `Ți-a fost atribuită verificarea ${numar} la ${verificare.locatie.denumire} pe ${new Date(validation.data.dataProgramata).toLocaleDateString('ro-RO')}.`,
        verificareId: verificare.id,
        url: `/verificari/${verificare.id}`,
      },
    })
  }

  await prisma.logActivitate.create({
    data: {
      userId: session.user.id,
      actiune: 'CREATE_VERIFICARE',
      entitate: 'Verificare',
      entitateId: verificare.id,
      detalii: JSON.stringify({ numar }),
    },
  })

  return NextResponse.json(verificare, { status: 201 })
}
