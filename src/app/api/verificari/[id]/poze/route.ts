export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const verificare = await prisma.verificare.findUnique({ where: { id: params.id } })
  if (!verificare) return NextResponse.json({ error: 'Nu există' }, { status: 404 })

  // Verifică permisii
  const canUpload = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role) ||
    (session.user.role === 'TEHNICIAN' && verificare.tehnicianId === session.user.id)
  if (!canUpload) return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })

  const formData = await req.formData()
  const files = formData.getAll('poze') as File[]

  if (!files.length) return NextResponse.json({ error: 'Nicio imagine' }, { status: 400 })

  const uploadDir = join(process.cwd(), 'public', 'uploads', params.id)
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const saved: { id: string; url: string; numeFisier: string }[] = []

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const ext = file.name.split('.').pop() ?? 'jpg'
    const numeFisier = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = join(uploadDir, numeFisier)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/${params.id}/${numeFisier}`
    const poza = await prisma.pozaVerificare.create({
      data: {
        verificareId: params.id,
        url,
        numeFisier: file.name,
        descriere: formData.get('descriere') as string | undefined ?? null,
        pozitie: (await prisma.pozaVerificare.count({ where: { verificareId: params.id } })),
      },
    })
    saved.push({ id: poza.id, url, numeFisier: file.name })
  }

  return NextResponse.json(saved, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  const { pozaId } = await req.json()
  await prisma.pozaVerificare.delete({ where: { id: pozaId } })
  return NextResponse.json({ message: 'Ștearsă' })
}
