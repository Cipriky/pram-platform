import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar, CheckCircle2, Clock, AlertTriangle, User } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate, formatDateTime, TIP_VERIFICARE_LABELS, ROLE_LABELS } from '@/lib/utils'
import { ToggleStatusBtn } from '@/components/tehnicieni/toggle-status-btn'

export const metadata: Metadata = { title: 'Profil tehnician' }

export default async function TehnicianProfilPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      verificariAlocate: {
        include: {
          locatie: { include: { client: { select: { id: true, denumire: true } } } },
        },
        orderBy: { dataProgramata: 'desc' },
        take: 30,
      },
    },
  })

  if (!user) notFound()

  const total = user.verificariAlocate.length
  const finalizate = user.verificariAlocate.filter(v => v.status === 'FINALIZATA').length
  const inDesfasurare = user.verificariAlocate.filter(v => v.status === 'IN_DESFASURARE').length
  const programate = user.verificariAlocate.filter(v => v.status === 'PROGRAMATA').length
  const admise = user.verificariAlocate.filter(v => v.rezultat === 'ADMIS').length
  const conformitate = finalizate > 0 ? Math.round((admise / finalizate) * 100) : 0

  return (
    <div>
      <Header title={`${user.prenume} ${user.nume}`} />
      <div className="p-6 space-y-6">
        <PageHeader title={`${user.prenume} ${user.nume}`} description={ROLE_LABELS[user.role]}>
          <Link href="/tehnicieni">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar profil */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 pb-4 text-center">
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-3xl font-bold mb-3">
                  {user.prenume.charAt(0)}{user.nume.charAt(0)}
                </div>
                <p className="font-semibold text-lg">{user.prenume} {user.nume}</p>
                <p className="text-sm text-gray-500">{ROLE_LABELS[user.role]}</p>
                <div className="mt-2">
                  <Badge variant={user.status === 'ACTIV' ? 'success' : 'secondary'}>
                    {user.status}
                  </Badge>
                </div>
              </CardContent>
              <div className="border-t px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.telefon && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.telefon}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Înregistrat {formatDate(user.createdAt)}</span>
                </div>
              </div>
              {session?.user?.role === 'ADMIN' && session.user.id !== user.id && (
                <div className="border-t px-4 py-3">
                  <ToggleStatusBtn userId={user.id} currentStatus={user.status} />
                </div>
              )}
            </Card>

            {/* Statistici */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Statistici</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {[
                  { label: 'Total verificări', value: total, color: 'text-gray-800' },
                  { label: 'Finalizate', value: finalizate, color: 'text-green-600' },
                  { label: 'În desfășurare', value: inDesfasurare, color: 'text-yellow-600' },
                  { label: 'Programate', value: programate, color: 'text-blue-600' },
                  { label: 'Conformitate', value: `${conformitate}%`, color: conformitate >= 80 ? 'text-green-600' : 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{s.label}</span>
                    <span className={`font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Verificări alocate */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Verificări alocate ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.verificariAlocate.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nicio verificare alocată.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.verificariAlocate.map(v => (
                      <Link
                        key={v.id}
                        href={`/verificari/${v.id}`}
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-sm font-semibold text-blue-600">{v.numar}</span>
                            <StatusVerificareBadge status={v.status} />
                            {v.rezultat && <RezultatVerificareBadge rezultat={v.rezultat} />}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {v.locatie.client.denumire} — {v.locatie.denumire}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">{TIP_VERIFICARE_LABELS[v.tip]}</p>
                          <p className="text-xs text-gray-500">{formatDate(v.dataProgramata)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
