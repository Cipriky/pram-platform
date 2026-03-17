import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { LocatieForm } from '@/components/forms/locatie-form'

export const metadata: Metadata = { title: 'Locație nouă' }

export default async function LocatieNouaPage({ searchParams }: { searchParams: { clientId?: string } }) {
  const session = await getAuthSession()
  const canCreate = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')
  if (!canCreate) redirect('/locatii')

  const clienti = await prisma.client.findMany({
    where: { status: 'ACTIV' },
    select: { id: true, denumire: true },
    orderBy: { denumire: 'asc' },
  })

  return (
    <div>
      <Header title="Locație nouă" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader title="Locație nouă" description="Adaugă o locație nouă pentru un client">
          <Link href="/locatii">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />Înapoi
            </Button>
          </Link>
        </PageHeader>
        <LocatieForm clienti={clienti} defaultClientId={searchParams.clientId} />
      </div>
    </div>
  )
}
