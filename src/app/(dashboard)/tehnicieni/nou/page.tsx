import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { UtilizatorForm } from '@/components/forms/utilizator-form'

export const metadata: Metadata = { title: 'Utilizator nou' }

export default async function UtilizatorNouPage() {
  const session = await getAuthSession()
  if (session?.user?.role !== 'ADMIN') redirect('/tehnicieni')

  return (
    <div>
      <Header title="Utilizator nou" />
      <div className="p-6 space-y-6 max-w-lg">
        <PageHeader title="Adaugă utilizator nou">
          <Link href="/tehnicieni">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />Înapoi
            </Button>
          </Link>
        </PageHeader>
        <UtilizatorForm />
      </div>
    </div>
  )
}
