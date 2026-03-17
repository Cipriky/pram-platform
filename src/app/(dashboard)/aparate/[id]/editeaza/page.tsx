import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { AparatForm } from '@/components/forms/aparat-form'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Editare aparat' }

export default async function EditareAparatPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) redirect('/aparate')

  const aparat = await prisma.aparatMasura.findUnique({ where: { id: params.id } })
  if (!aparat) notFound()

  return (
    <div>
      <Header title="Editare aparat" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader title={`Editare: ${aparat.denumire}`}>
          <Link href={`/aparate/${params.id}`}>
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Înapoi</Button>
          </Link>
        </PageHeader>
        <AparatForm
          aparatId={params.id}
          defaultValues={{
            denumire: aparat.denumire,
            producator: aparat.producator,
            model: aparat.model,
            serieNumar: aparat.serieNumar,
            anFabricatie: aparat.anFabricatie ?? undefined,
            dataAchizitie: aparat.dataAchizitie ? format(aparat.dataAchizitie, 'yyyy-MM-dd') : undefined,
            dataUltimaEtalonare: aparat.dataUltimaEtalonare ? format(aparat.dataUltimaEtalonare, 'yyyy-MM-dd') : undefined,
            dataUrmatoareEtalonare: aparat.dataUrmatoareEtalonare ? format(aparat.dataUrmatoareEtalonare, 'yyyy-MM-dd') : undefined,
            certificatEtalonare: aparat.certificatEtalonare ?? undefined,
            status: aparat.status,
            observatii: aparat.observatii ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
