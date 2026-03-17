import { Metadata } from 'next'
import Link from 'next/link'
import { Bell, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ReminderActions } from '@/components/remindere/reminder-actions'

export const metadata: Metadata = { title: 'Remindere' }

const TIP_LABELS: Record<string, string> = {
  VERIFICARE_PERIODICA: 'Verificare periodică',
  ETALONARE_APARAT: 'Etalonare aparat',
  EXPIRARE_CONTRACT: 'Expirare contract',
  ALTELE: 'Altele',
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'secondary' | 'destructive'> = {
  ACTIV: 'default',
  TRIMIS: 'success',
  DEZACTIVAT: 'secondary',
}

export default async function ReminderePage() {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const [active, sent, deactivated] = await Promise.all([
    prisma.reminder.findMany({
      where: { status: 'ACTIV' },
      include: {
        locatie: { select: { id: true, denumire: true, client: { select: { id: true, denumire: true } } } },
        verificare: { select: { id: true, numar: true } },
      },
      orderBy: { dataTrigger: 'asc' },
    }),
    prisma.reminder.findMany({
      where: { status: 'TRIMIS' },
      include: {
        locatie: { select: { id: true, denumire: true, client: { select: { id: true, denumire: true } } } },
        verificare: { select: { id: true, numar: true } },
      },
      orderBy: { dataTrimis: 'desc' },
      take: 20,
    }),
    prisma.reminder.count({ where: { status: 'DEZACTIVAT' } }),
  ])

  const now = new Date()
  const overdue = active.filter(r => new Date(r.dataTrigger) < now)
  const upcoming = active.filter(r => new Date(r.dataTrigger) >= now)

  return (
    <div>
      <Header title="Remindere" />
      <div className="p-6 space-y-8">
        <PageHeader
          title="Remindere & Alerte"
          description={`${active.length} active · ${sent.length} trimise recent`}
        />

        {/* Sumar */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
                  <p className="text-xs text-gray-500">Expirate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
                  <p className="text-xs text-gray-500">Programate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{sent.length}</p>
                  <p className="text-xs text-gray-500">Trimise</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expirate */}
        {overdue.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expirate — necesită atenție ({overdue.length})
            </h2>
            <div className="space-y-2">
              {overdue.map(r => (
                <ReminderCard key={r.id} reminder={r} overdue />
              ))}
            </div>
          </div>
        )}

        {/* Programate */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programate ({upcoming.length})
            </h2>
            <div className="space-y-2">
              {upcoming.map(r => (
                <ReminderCard key={r.id} reminder={r} />
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">Niciun reminder activ</p>
            </CardContent>
          </Card>
        )}

        {/* Trimise recent */}
        {sent.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Trimise recent
            </h2>
            <div className="space-y-2">
              {sent.map(r => (
                <ReminderCard key={r.id} reminder={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReminderCard({ reminder, overdue }: { reminder: any; overdue?: boolean }) {
  return (
    <div className={`rounded-xl border bg-white p-4 flex items-start gap-4 ${overdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${overdue ? 'bg-red-100' : 'bg-blue-50'}`}>
        <Bell className={`h-4 w-4 ${overdue ? 'text-red-600' : 'text-blue-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm">{reminder.titlu}</p>
          <Badge variant={reminder.status === 'TRIMIS' ? 'success' : reminder.status === 'DEZACTIVAT' ? 'secondary' : overdue ? 'destructive' : 'default'} className="text-xs">
            {TIP_LABELS[reminder.tip] ?? reminder.tip}
          </Badge>
        </div>
        {reminder.mesaj && <p className="text-xs text-gray-500 mb-1">{reminder.mesaj}</p>}
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateTime(reminder.dataTrigger)}
          </span>
          {reminder.locatie && (
            <Link href={`/locatii/${reminder.locatie.id}`} className="text-blue-600 hover:underline">
              {reminder.locatie.client?.denumire} — {reminder.locatie.denumire}
            </Link>
          )}
          {reminder.verificare && (
            <Link href={`/verificari/${reminder.verificare.id}`} className="text-blue-600 hover:underline">
              {reminder.verificare.numar}
            </Link>
          )}
        </div>
      </div>
      <ReminderActions reminderId={reminder.id} status={reminder.status} />
    </div>
  )
}
