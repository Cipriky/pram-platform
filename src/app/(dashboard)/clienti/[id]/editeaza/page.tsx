import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { ClientForm } from '@/components/forms/client-form'

export const metadata: Metadata = { title: 'Editare client' }

export default async function EditareClientPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  const canEdit = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')
  if (!canEdit) redirect('/clienti')

  const client = await prisma.client.findUnique({ where: { id: params.id } })
  if (!client) notFound()

  return (
    <div>
      <Header title="Editare client" />
      <div className="p-6 space-y-6 max-w-3xl">
        <PageHeader title={`Editare: ${client.denumire}`}>
          <Link href={`/clienti/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />Înapoi
            </Button>
          </Link>
        </PageHeader>
        <ClientForm
          clientId={params.id}
          defaultValues={{
            denumire: client.denumire,
            tip: client.tip,
            cui: client.cui,
            nrRegCom: client.nrRegCom,
            adresa: client.adresa,
            oras: client.oras,
            judet: client.judet,
            codPostal: client.codPostal,
            telefon: client.telefon,
            email: client.email,
            website: client.website,
            persoanaContact: client.persoanaContact,
            telefonContact: client.telefonContact,
            emailContact: client.emailContact,
            status: client.status,
            observatii: client.observatii,
          }}
        />
      </div>
    </div>
  )
}
