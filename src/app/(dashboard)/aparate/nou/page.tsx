import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { AparatForm } from '@/components/forms/aparat-form'

export const metadata: Metadata = { title: 'Aparat nou' }

export default function AparatNouPage() {
  return (
    <div>
      <Header title="Aparat nou" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader title="Înregistrare aparat de măsură">
          <Link href="/aparate">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
        </PageHeader>
        <AparatForm />
      </div>
    </div>
  )
}
