import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { StatusAparatMasura } from '@prisma/client'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusAparatBadge } from '@/components/shared/status-badge'
import { formatDate, isExpiringSoon, isExpired } from '@/lib/utils'

export const metadata: Metadata = { title: 'Aparate de măsură' }

export default async function AparatePage() {
  const session = await getAuthSession()

  // Marchează automat ca INACTIV aparatele cu etalonarea expirată
  await prisma.aparatMasura.updateMany({
    where: {
      dataUrmatoareEtalonare: { lt: new Date() },
      status: { not: StatusAparatMasura.INACTIV },
    },
    data: { status: StatusAparatMasura.INACTIV },
  })

  const aparate = await prisma.aparatMasura.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const canCreate = ['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')

  return (
    <div>
      <Header title="Aparate de măsură" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Aparate de măsură"
          description={`${aparate.length} aparate înregistrate`}
        >
          {canCreate && (
            <Link href="/aparate/nou">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Aparat nou
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Alerte etalonare */}
        {aparate.some(a => isExpiringSoon(a.dataUrmatoareEtalonare, 30) || isExpired(a.dataUrmatoareEtalonare)) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium text-sm">
                {aparate.filter(a => isExpired(a.dataUrmatoareEtalonare)).length} aparat(e) cu etalonarea expirată,{' '}
                {aparate.filter(a => isExpiringSoon(a.dataUrmatoareEtalonare, 30) && !isExpired(a.dataUrmatoareEtalonare)).length} aparat(e) cu etalonarea în 30 zile
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {aparate.map(aparat => {
            const expired = isExpired(aparat.dataUrmatoareEtalonare)
            const expiringSoon = isExpiringSoon(aparat.dataUrmatoareEtalonare, 30)

            return (
              <Link key={aparat.id} href={`/aparate/${aparat.id}`}>
                <Card className={`hover:shadow-md transition-all cursor-pointer ${
                  expired ? 'border-red-200' : expiringSoon ? 'border-amber-200' : ''
                }`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                        expired ? 'bg-red-50' : expiringSoon ? 'bg-amber-50' : 'bg-gray-50'
                      }`}>
                        <Wrench className={`h-5 w-5 ${
                          expired ? 'text-red-500' : expiringSoon ? 'text-amber-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{aparat.denumire}</p>
                        <p className="text-xs text-gray-500">{aparat.producator} {aparat.model}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{aparat.serieNumar}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Status</span>
                        <StatusAparatBadge status={aparat.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Etalonare valabilă până</span>
                        <div className="flex items-center gap-1">
                          {expired ? (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          ) : expiringSoon ? (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          ) : aparat.dataUrmatoareEtalonare ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : null}
                          <span className={`text-xs font-medium ${
                            expired ? 'text-red-600' : expiringSoon ? 'text-amber-600' : 'text-gray-600'
                          }`}>
                            {formatDate(aparat.dataUrmatoareEtalonare)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          {aparate.length === 0 && (
            <div className="col-span-3 flex flex-col items-center py-16 text-gray-400">
              <Wrench className="h-12 w-12 mb-3 opacity-30" />
              <p>Nu există aparate de măsură înregistrate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
