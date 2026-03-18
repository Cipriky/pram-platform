import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { getAuthSession } from '@/lib/auth'
import { ClientiTable } from '@/components/clienti/clienti-table'
import { ImportClientiButton } from '@/components/clienti/import-clienti-button'

export const metadata: Metadata = { title: 'Clienți' }

export default async function ClientiPage() {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const clienti = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { locatii: true },
      },
    },
  })

  const canCreate = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')

  return (
    <div>
      <Header title="Clienți" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Clienți"
          description={`${clienti.length} clienți înregistrați`}
        >
          {canCreate && (
            <>
              <ImportClientiButton />
              <Link href="/clienti/nou">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Client nou
                </Button>
              </Link>
            </>
          )}
        </PageHeader>

        <ClientiTable data={clienti} />
      </div>
    </div>
  )
}
