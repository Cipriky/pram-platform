import { Metadata } from 'next'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  Building2,
  MapPin,
  ClipboardCheck,
  Wrench,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { startOfMonth, endOfMonth } from 'date-fns'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardData(userId: string, role: string) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [
    totalClienti,
    totalLocatii,
    verificariLuna,
    verificariProgramate,
    verificariInDesfasurare,
    aparateNecesitaEtalonare,
    ultimeleVerificari,
    remindereActive,
    notificariNecitite,
  ] = await Promise.all([
    prisma.client.count({ where: { status: 'ACTIV' } }),
    prisma.locatie.count({ where: { status: 'ACTIVA' } }),
    prisma.verificare.count({
      where: {
        dataProgramata: { gte: monthStart, lte: monthEnd },
        ...(role === 'TEHNICIAN' ? { tehnicianId: userId } : {}),
      },
    }),
    prisma.verificare.count({
      where: {
        status: 'PROGRAMATA',
        ...(role === 'TEHNICIAN' ? { tehnicianId: userId } : {}),
      },
    }),
    prisma.verificare.count({
      where: {
        status: 'IN_DESFASURARE',
        ...(role === 'TEHNICIAN' ? { tehnicianId: userId } : {}),
      },
    }),
    prisma.aparatMasura.count({
      where: {
        OR: [
          { status: 'INACTIV' },
          {
            status: 'ACTIV',
            dataUrmatoareEtalonare: {
              lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    }),
    prisma.verificare.findMany({
      take: 8,
      orderBy: { updatedAt: 'desc' },
      where: role === 'TEHNICIAN' ? { tehnicianId: userId } : {},
      include: {
        locatie: {
          include: { client: { select: { denumire: true } } },
        },
        tehnician: {
          select: { prenume: true, nume: true },
        },
      },
    }),
    prisma.reminder.count({ where: { status: 'ACTIV', dataTrigger: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.notificare.count({ where: { userId, citita: false } }),
  ])

  return {
    totalClienti,
    totalLocatii,
    verificariLuna,
    verificariProgramate,
    verificariInDesfasurare,
    aparateNecesitaEtalonare,
    ultimeleVerificari,
    remindereActive,
    notificariNecitite,
  }
}

export default async function DashboardPage() {
  const session = await getAuthSession()
  if (!session) return null

  const data = await getDashboardData(session.user.id, session.user.role)

  const isTehnician = session.user.role === 'TEHNICIAN'

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Bun venit, {session.user.name?.split(' ')[0]}!
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isTehnician && (
            <>
              <StatCard
                title="Clienți activi"
                value={data.totalClienti}
                icon={Building2}
                color="blue"
                description="clienți înregistrați"
              />
              <StatCard
                title="Locații active"
                value={data.totalLocatii}
                icon={MapPin}
                color="green"
                description="locații gestionate"
              />
            </>
          )}
          <StatCard
            title="Verificări luna aceasta"
            value={data.verificariLuna}
            icon={ClipboardCheck}
            color="purple"
            description="total lunar"
          />
          <StatCard
            title="Programate"
            value={data.verificariProgramate}
            icon={Calendar}
            color="yellow"
            description="în așteptare"
          />
          <StatCard
            title="În desfășurare"
            value={data.verificariInDesfasurare}
            icon={Clock}
            color="blue"
            description="active acum"
          />
          {!isTehnician && (
            <StatCard
              title="Alerte aparate"
              value={data.aparateNecesitaEtalonare}
              icon={Wrench}
              color="red"
              description="inactive sau expiră în 30 zile"
            />
          )}
        </div>

        {/* Alerts row */}
        {(data.remindereActive > 0 || data.aparateNecesitaEtalonare > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.remindereActive > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">
                    {data.remindereActive} reminder{data.remindereActive > 1 ? 'e' : ''} active în 7 zile
                  </p>
                  <Link href="/remindere" className="text-xs text-amber-600 hover:underline">
                    Vezi toate →
                  </Link>
                </div>
              </div>
            )}
            {data.aparateNecesitaEtalonare > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <Wrench className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 text-sm">
                    {data.aparateNecesitaEtalonare} aparat{data.aparateNecesitaEtalonare > 1 ? 'e' : ''} necesită etalonare
                  </p>
                  <Link href="/aparate" className="text-xs text-red-600 hover:underline">
                    Gestionează →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent verifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {isTehnician ? 'Verificările mele recente' : 'Verificări recente'}
              </CardTitle>
              <Link href="/verificari" className="text-sm text-blue-600 hover:underline font-medium">
                Vezi toate →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {data.ultimeleVerificari.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <CheckCircle2 className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">Nu există verificări recente.</p>
                </div>
              ) : (
                data.ultimeleVerificari.map((v, i) => (
                  <Link
                    key={v.id}
                    href={`/verificari/${v.id}`}
                    className="flex items-center gap-4 py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs flex-shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {v.numar} — {v.locatie.denumire}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {v.locatie.client.denumire} · {formatDate(v.dataProgramata)}
                        {v.tehnician && ` · ${v.tehnician.prenume} ${v.tehnician.nume}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusVerificareBadge status={v.status} />
                      {v.rezultat && <RezultatVerificareBadge rezultat={v.rezultat} />}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
