import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { ClientForm } from '@/components/forms/client-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Client nou' }

export default function ClientNouPage() {
  return (
    <div>
      <Header title="Client nou" />
      <div className="p-6 space-y-6 max-w-3xl">
        <PageHeader
          title="Client nou"
          description="Adaugă un client nou în platformă"
        >
          <Link href="/clienti">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
        </PageHeader>

        <ClientForm />
      </div>
    </div>
  )
}
