import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, MapPin, ClipboardCheck, Phone, Mail, Globe } from 'lucide-react'
import prisma from '@/lib/db'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusClientBadge, StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Detalii client' }

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      locatii: {
        include: {
          _count: { select: { verificari: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      contracte: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!client) notFound()

  const verificariRecente = await prisma.verificare.findMany({
    where: { locatie: { clientId: client.id } },
    take: 5,
    orderBy: { dataProgramata: 'desc' },
    include: {
      locatie: { select: { denumire: true } },
      tehnician: { select: { prenume: true, nume: true } },
    },
  })

  const tipLabels: Record<string, string> = {
    PERSOANA_JURIDICA: 'Persoană juridică',
    PERSOANA_FIZICA: 'Persoană fizică',
    INSTITUTIE_PUBLICA: 'Instituție publică',
  }

  return (
    <div>
      <Header title={client.denumire} />
      <div className="p-6 space-y-6">
        <PageHeader
          title={client.denumire}
          description={`${client.cod} · ${tipLabels[client.tip] ?? client.tip}`}
        >
          <Link href="/clienti">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
          <Link href={`/clienti/${client.id}/editeaza`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editează
            </Button>
          </Link>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date generale */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Date generale</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">CUI / CNP</dt>
                    <dd className="mt-1 font-mono">{client.cui ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Nr. Reg. Comerțului</dt>
                    <dd className="mt-1">{client.nrRegCom ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Adresă</dt>
                    <dd className="mt-1">{client.adresa ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Localitate</dt>
                    <dd className="mt-1">
                      {client.oras ? `${client.oras}, jud. ${client.judet}` : '-'}
                      {client.codPostal && ` (${client.codPostal})`}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{client.telefon ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{client.email ?? '-'}</span>
                  </div>
                  {client.website && (
                    <div className="col-span-2 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-gray-400" />
                      <a href={client.website} target="_blank" className="text-blue-600 hover:underline">{client.website}</a>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Persoana contact */}
            {(client.persoanaContact || client.telefonContact || client.emailContact) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Persoană de contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Nume</dt>
                      <dd className="mt-1 font-medium">{client.persoanaContact ?? '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Telefon</dt>
                      <dd className="mt-1">{client.telefonContact ?? '-'}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-500">Email</dt>
                      <dd className="mt-1">{client.emailContact ?? '-'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Verificări recente */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Verificări recente</CardTitle>
                  <Link href={`/verificari?clientId=${client.id}`} className="text-xs text-blue-600 hover:underline">
                    Toate verificările →
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {verificariRecente.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">Nu există verificări pentru acest client.</p>
                ) : (
                  <div className="space-y-2">
                    {verificariRecente.map(v => (
                      <Link
                        key={v.id}
                        href={`/verificari/${v.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{v.numar} — {v.locatie.denumire}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(v.dataProgramata)}
                            {v.tehnician && ` · ${v.tehnician.prenume} ${v.tehnician.nume}`}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
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

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <StatusClientBadge status={client.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tip</span>
                    <span className="text-sm font-medium">{tipLabels[client.tip] ?? client.tip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Înregistrat</span>
                    <span className="text-sm">{formatDate(client.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistici */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Statistici</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{client.locatii.length}</p>
                    <p className="text-xs text-gray-500">Locații</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{verificariRecente.length}+</p>
                    <p className="text-xs text-gray-500">Verificări totale</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locații */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Locații</CardTitle>
                  <Link href={`/locatii/nou?clientId=${client.id}`} className="text-xs text-blue-600 hover:underline">
                    + Adaugă
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.locatii.length === 0 ? (
                  <p className="text-xs text-gray-500">Nicio locație adăugată.</p>
                ) : (
                  client.locatii.map(loc => (
                    <Link
                      key={loc.id}
                      href={`/locatii/${loc.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{loc.denumire}</p>
                        <p className="text-[10px] text-gray-400">{loc.oras}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {loc._count.verificari}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
