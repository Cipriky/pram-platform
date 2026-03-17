export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { masuratorieSchema } from '@/lib/validations/verificare'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  // Verificăm că verificarea există și aparține tehnicianului (sau e manager/admin)
  const verificare = await prisma.verificare.findUnique({ where: { id: params.id } })
  if (!verificare) return NextResponse.json({ error: 'Verificare negăsită' }, { status: 404 })

  if (session.user.role === 'TEHNICIAN' && verificare.tehnicianId !== session.user.id) {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await req.json()
  const validation = masuratorieSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  // Calculăm conformitatea automat dacă avem valoare admisă
  let conformitate: boolean | undefined
  if (validation.data.valoareAdmisa !== null && validation.data.valoareAdmisa !== undefined) {
    conformitate = validation.data.valoareMasurata <= validation.data.valoareAdmisa
  }

  const masuratore = await prisma.masuratore.create({
    data: {
      verificareId: params.id,
      tip: validation.data.tip,
      denumire: validation.data.denumire,
      localizare: validation.data.localizare ?? null,
      valoareMasurata: validation.data.valoareMasurata,
      unitateMasura: validation.data.unitateMasura,
      valoareAdmisa: validation.data.valoareAdmisa ?? null,
      conformitate: conformitate ?? null,
      observatii: validation.data.observatii ?? null,
    },
  })

  return NextResponse.json(masuratore, { status: 201 })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const verificare = await prisma.verificare.findUnique({ where: { id: params.id } })
  if (!verificare) return NextResponse.json({ error: 'Verificare negăsită' }, { status: 404 })

  if (session.user.role === 'TEHNICIAN' && verificare.tehnicianId !== session.user.id) {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  const body = await req.json()
  const { masuratorieId, ...rest } = body
  if (!masuratorieId) return NextResponse.json({ error: 'ID măsurătoare lipsă' }, { status: 400 })

  const validation = masuratorieSchema.safeParse(rest)
  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  let conformitate: boolean | null = null
  if (validation.data.valoareAdmisa !== null && validation.data.valoareAdmisa !== undefined) {
    conformitate = validation.data.valoareMasurata <= validation.data.valoareAdmisa
  }

  const updated = await prisma.masuratore.update({
    where: { id: masuratorieId },
    data: {
      tip: validation.data.tip,
      denumire: validation.data.denumire,
      localizare: validation.data.localizare ?? null,
      valoareMasurata: validation.data.valoareMasurata,
      unitateMasura: validation.data.unitateMasura,
      valoareAdmisa: validation.data.valoareAdmisa ?? null,
      conformitate,
      observatii: validation.data.observatii ?? null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const masuratorieId = searchParams.get('masuratorieId')
  if (!masuratorieId) return NextResponse.json({ error: 'ID măsurătoare lipsă' }, { status: 400 })

  await prisma.masuratore.delete({ where: { id: masuratorieId } })
  return NextResponse.json({ message: 'Măsurătoare ștearsă' })
}
