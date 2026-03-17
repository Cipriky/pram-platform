import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { VerificareForm } from '@/components/forms/verificare-form'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Editare verificare' }

export default async function EditareVerificarePage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  const canEdit = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')
  if (!canEdit) redirect(`/verificari/${params.id}`)

  const [verificare, locatii, tehnicieni] = await Promise.all([
    prisma.verificare.findUnique({ where: { id: params.id } }),
    prisma.locatie.findMany({
      where: { status: 'ACTIVA' },
      include: { client: { select: { denumire: true } } },
      orderBy: { denumire: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'TEHNICIAN', status: 'ACTIV' },
      select: { id: true, prenume: true, nume: true },
    }),
  ])

  if (!verificare) notFound()

  return (
    <div>
      <Header title="Editare verificare" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader title={`Editare: ${verificare.numar}`}>
          <Link href={`/verificari/${params.id}`}>
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Înapoi</Button>
          </Link>
        </PageHeader>
        <VerificareForm
          locatii={locatii}
          tehnicieni={tehnicieni}
          verificareId={params.id}
          defaultValues={{
            tip: verificare.tip,
            locatieId: verificare.locatieId,
            tehnicianId: verificare.tehnicianId ?? undefined,
            dataProgramata: format(verificare.dataProgramata, "yyyy-MM-dd'T'HH:mm"),
            durataPlanificata: verificare.durataPlanificata ?? undefined,
            observatiiProgramare: verificare.observatiiProgramare ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
