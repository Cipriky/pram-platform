import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { VerificareForm } from '@/components/forms/verificare-form'

export const metadata: Metadata = { title: 'Verificare nouă' }

export default async function VerificareNouaPage() {
  const session = await getAuthSession()
  const canCreate = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')
  if (!canCreate) redirect('/verificari')

  const [locatii, tehnicieni] = await Promise.all([
    prisma.locatie.findMany({
      where: { status: 'ACTIVA' },
      include: { client: { select: { denumire: true } } },
      orderBy: { denumire: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'TEHNICIAN', status: 'ACTIV' },
      select: { id: true, prenume: true, nume: true },
      orderBy: { nume: 'asc' },
    }),
  ])

  return (
    <div>
      <Header title="Verificare nouă" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader
          title="Programare verificare PRAM"
          description="Programează o nouă verificare și alocă un tehnician"
        >
          <Link href="/verificari">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
        </PageHeader>

        <VerificareForm locatii={locatii} tehnicieni={tehnicieni} />
      </div>
    </div>
  )
}
