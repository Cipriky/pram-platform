import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, AlertTriangle, CheckCircle2 } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusAparatBadge } from '@/components/shared/status-badge'
import { formatDate, isExpired, isExpiringSoon } from '@/lib/utils'
import { SetDefaultButton } from '@/components/aparate/set-default-button'

export const metadata: Metadata = { title: 'Detalii aparat' }

export default async function AparatDetailPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()

  const aparat = await prisma.aparatMasura.findUnique({
    where: { id: params.id },
  })

  if (!aparat) notFound()

  const canEdit = ['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')
  const etalonareExpirata = isExpired(aparat.dataUrmatoareEtalonare)
  const etalonareAproape = isExpiringSoon(aparat.dataUrmatoareEtalonare, 30)

  return (
    <div>
      <Header title={aparat.denumire} />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader
          title={aparat.denumire}
          description={`${aparat.cod} · ${aparat.producator} ${aparat.model}`}
        >
          <Link href="/aparate">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
          {canEdit && (
            <SetDefaultButton aparatId={aparat.id} isDefault={aparat.isDefault} />
          )}
          {canEdit && (
            <Link href={`/aparate/${aparat.id}/editeaza`}>
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editează
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Alert etalonare */}
        {(etalonareExpirata || etalonareAproape) && (
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${
            etalonareExpirata ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
          }`}>
            <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${etalonareExpirata ? 'text-red-500' : 'text-amber-500'}`} />
            <p className={`text-sm font-medium ${etalonareExpirata ? 'text-red-700' : 'text-amber-700'}`}>
              {etalonareExpirata
                ? 'Etalonarea acestui aparat a expirat! Este interzisă utilizarea lui în verificări.'
                : `Etalonarea expiră în curând (${formatDate(aparat.dataUrmatoareEtalonare)}). Programați etalonarea.`
              }
            </p>
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Date identificare</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Cod intern</dt>
                <dd className="mt-1 font-mono font-medium">{aparat.cod}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1"><StatusAparatBadge status={aparat.status} /></dd>
              </div>
              <div>
                <dt className="text-gray-500">Producător</dt>
                <dd className="mt-1 font-medium">{aparat.producator}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Model</dt>
                <dd className="mt-1 font-medium">{aparat.model}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Nr. serie</dt>
                <dd className="mt-1 font-mono">{aparat.serieNumar}</dd>
              </div>
              <div>
                <dt className="text-gray-500">An fabricație</dt>
                <dd className="mt-1">{aparat.anFabricatie ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Dată achiziție</dt>
                <dd className="mt-1">{formatDate(aparat.dataAchizitie)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Etalonare metrologică</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Ultima etalonare</dt>
                <dd className="mt-1 font-medium">{formatDate(aparat.dataUltimaEtalonare)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Următoarea etalonare</dt>
                <dd className={`mt-1 font-medium flex items-center gap-1.5 ${
                  etalonareExpirata ? 'text-red-600' : etalonareAproape ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {etalonareExpirata ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : aparat.dataUrmatoareEtalonare ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : null}
                  {formatDate(aparat.dataUrmatoareEtalonare)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Nr. certificat etalonare</dt>
                <dd className="mt-1 font-mono">{aparat.certificatEtalonare ?? '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {aparat.observatii && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Observații</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{aparat.observatii}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
