import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { FinalizeazaForm } from '@/components/forms/finalizeaza-form'

export const metadata: Metadata = { title: 'Finalizează verificare' }

export default async function FinalizeazaPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) redirect('/login')

  const verificare = await prisma.verificare.findUnique({
    where: { id: params.id },
    include: {
      locatie: { include: { client: true } },
      masuratori: true,
    },
  })

  if (!verificare) notFound()
  if (verificare.status === 'FINALIZATA') redirect(`/verificari/${params.id}`)

  const canFinalize =
    ['ADMIN', 'MANAGER'].includes(session.user.role) ||
    (session.user.role === 'TEHNICIAN' && verificare.tehnicianId === session.user.id)

  if (!canFinalize) redirect(`/verificari/${params.id}`)

  return (
    <div>
      <Header title="Finalizează verificare" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader
          title={`Finalizare ${verificare.numar}`}
          description={`${verificare.locatie.denumire} · ${verificare.locatie.client.denumire}`}
        >
          <Link href={`/verificari/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
        </PageHeader>

        <FinalizeazaForm
          verificareId={params.id}
          masuratoriCount={verificare.masuratori.length}
          masuratoriFailed={verificare.masuratori.filter(m => m.conformitate === false).length}
        />
      </div>
    </div>
  )
}
