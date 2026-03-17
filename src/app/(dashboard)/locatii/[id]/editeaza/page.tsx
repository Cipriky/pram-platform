import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { LocatieForm } from '@/components/forms/locatie-form'

export const metadata: Metadata = { title: 'Editare locație' }

export default async function EditareLocatiePage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')) redirect('/locatii')

  const [locatie, clienti] = await Promise.all([
    prisma.locatie.findUnique({ where: { id: params.id } }),
    prisma.client.findMany({ where: { status: 'ACTIV' }, select: { id: true, denumire: true }, orderBy: { denumire: 'asc' } }),
  ])

  if (!locatie) notFound()

  return (
    <div>
      <Header title="Editare locație" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader title={`Editare: ${locatie.denumire}`}>
          <Link href={`/locatii/${params.id}`}>
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Înapoi</Button>
          </Link>
        </PageHeader>
        <LocatieForm
          clienti={clienti}
          locatieId={params.id}
          defaultValues={{
            denumire: locatie.denumire,
            tip: locatie.tip,
            clientId: locatie.clientId,
            adresa: locatie.adresa,
            oras: locatie.oras,
            judet: locatie.judet,
            codPostal: locatie.codPostal ?? undefined,
            telefon: locatie.telefon ?? undefined,
            email: locatie.email ?? undefined,
            persoanaContact: locatie.persoanaContact ?? undefined,
            telefonContact: locatie.telefonContact ?? undefined,
            status: locatie.status,
            suprafata: locatie.suprafata ?? undefined,
            descriere: locatie.descriere ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
