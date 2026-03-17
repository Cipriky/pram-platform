import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate, formatDateTime, TIP_VERIFICARE_LABELS } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Verificări PRAM' }

export default async function VerificariPage() {
  const session = await getAuthSession()
  if (!session) return null

  const isTehnician = session.user.role === 'TEHNICIAN'
  const canCreate = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role)

  const verificari = await prisma.verificare.findMany({
    where: isTehnician ? { tehnicianId: session.user.id } : {},
    orderBy: { dataProgramata: 'desc' },
    include: {
      locatie: {
        include: {
          client: { select: { denumire: true, cod: true } },
        },
      },
      tehnician: { select: { prenume: true, nume: true } },
      _count: { select: { masuratori: true, poze: true } },
    },
  })

  const stats = {
    programate: verificari.filter(v => v.status === 'PROGRAMATA').length,
    inDesfasurare: verificari.filter(v => v.status === 'IN_DESFASURARE').length,
    finalizate: verificari.filter(v => v.status === 'FINALIZATA').length,
    total: verificari.length,
  }

  return (
    <div>
      <Header title="Verificări PRAM" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Verificări PRAM"
          description={isTehnician ? 'Verificările tale' : 'Toate verificările din sistem'}
        >
          {canCreate && (
            <Link href="/verificari/nou">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Verificare nouă
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Status tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
            { label: 'Programate', value: stats.programate, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'În desfășurare', value: stats.inDesfasurare, color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Finalizate', value: stats.finalizate, color: 'bg-green-50 border-green-200 text-green-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            {verificari.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <p className="text-sm">Nu există verificări.</p>
                {canCreate && (
                  <Link href="/verificari/nou" className="mt-2 text-sm text-blue-600 hover:underline">
                    Programează prima verificare →
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {verificari.map(v => (
                  <Link
                    key={v.id}
                    href={`/verificari/${v.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Status indicator */}
                    <div className={`h-10 w-1 rounded-full flex-shrink-0 ${
                      v.status === 'FINALIZATA' ? 'bg-green-400' :
                      v.status === 'IN_DESFASURARE' ? 'bg-amber-400' :
                      v.status === 'ANULATA' ? 'bg-red-400' : 'bg-blue-400'
                    }`} />

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{v.numar}</span>
                        <span className="text-gray-400 text-sm">—</span>
                        <span className="font-medium text-gray-800 text-sm truncate">
                          {v.locatie.denumire}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{v.locatie.client.denumire}</span>
                        <span>·</span>
                        <span>{TIP_VERIFICARE_LABELS[v.tip] ?? v.tip}</span>
                        <span>·</span>
                        <span>{formatDate(v.dataProgramata)}</span>
                        {v.tehnician && (
                          <>
                            <span>·</span>
                            <span>{v.tehnician.prenume} {v.tehnician.nume}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Counts */}
                    <div className="hidden md:flex items-center gap-3 text-xs text-gray-400">
                      <span>{v._count.masuratori} măs.</span>
                      <span>{v._count.poze} poze</span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusVerificareBadge status={v.status} />
                      {v.rezultat && <RezultatVerificareBadge rezultat={v.rezultat} />}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
