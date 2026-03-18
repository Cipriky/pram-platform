import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { VerificariViewToggle } from '@/components/verificari/verificari-view-toggle'

export const metadata: Metadata = { title: 'Verificări PRAM' }

export default async function VerificariPage() {
  const session = await getAuthSession()
  if (!session) return null

  const isTehnician = session.user.role === 'TEHNICIAN'
  const canCreate = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role)

  const [verificari, tehnicieni] = await Promise.all([
    prisma.verificare.findMany({
      where: isTehnician ? { tehnicianId: session.user.id } : {},
      orderBy: { dataProgramata: 'desc' },
      include: {
        locatie: {
          include: { client: { select: { denumire: true, cod: true } } },
        },
        tehnician: { select: { id: true, prenume: true, nume: true } },
        _count: { select: { masuratori: true, poze: true } },
      },
    }),
    isTehnician
      ? []
      : prisma.user.findMany({
          where: { role: 'TEHNICIAN', status: 'ACTIV' },
          select: { id: true, prenume: true, nume: true },
          orderBy: { nume: 'asc' },
        }),
  ])

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

        {/* Statistici */}
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

        <VerificariViewToggle
          verificari={verificari as any}
          tehnicieni={tehnicieni}
          canCreate={canCreate}
        />
      </div>
    </div>
  )
}
