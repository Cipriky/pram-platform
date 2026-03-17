import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, MapPin, ClipboardCheck, Plus } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate, TIP_VERIFICARE_LABELS } from '@/lib/utils'

export const metadata: Metadata = { title: 'Detalii locație' }

export default async function LocatieDetailPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()

  const locatie = await prisma.locatie.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, denumire: true, cod: true } },
      verificari: {
        orderBy: { dataProgramata: 'desc' },
        take: 10,
        include: {
          tehnician: { select: { prenume: true, nume: true } },
        },
      },
      _count: { select: { verificari: true } },
    },
  })

  if (!locatie) notFound()

  const canEdit = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')

  const tipLabels: Record<string, string> = {
    SEDIU_PRINCIPAL: 'Sediu principal',
    PUNCT_DE_LUCRU: 'Punct de lucru',
    DEPOZIT: 'Depozit',
    HALA_PRODUCTIE: 'Hală producție',
    BIROU: 'Birou',
    ALTELE: 'Altele',
  }

  return (
    <div>
      <Header title={locatie.denumire} />
      <div className="p-6 space-y-6">
        <PageHeader
          title={locatie.denumire}
          description={`${locatie.cod} · ${tipLabels[locatie.tip] ?? locatie.tip}`}
        >
          <Link href="/locatii">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />Înapoi
            </Button>
          </Link>
          {canEdit && (
            <>
              <Link href={`/verificari/nou?locatieId=${locatie.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />Verificare nouă
                </Button>
              </Link>
              <Link href={`/locatii/${locatie.id}/editeaza`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />Editează
                </Button>
              </Link>
            </>
          )}
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />Informații locație
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Client</dt>
                    <dd className="mt-1">
                      <Link href={`/clienti/${locatie.client.id}`} className="font-semibold text-blue-600 hover:underline">
                        {locatie.client.denumire}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Tip</dt>
                    <dd className="mt-1"><Badge variant="secondary">{tipLabels[locatie.tip]}</Badge></dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Adresă</dt>
                    <dd className="mt-1 font-medium">{locatie.adresa}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Localitate</dt>
                    <dd className="mt-1">{locatie.oras}, jud. {locatie.judet}</dd>
                  </div>
                  {locatie.suprafata && (
                    <div>
                      <dt className="text-gray-500">Suprafață</dt>
                      <dd className="mt-1">{locatie.suprafata} m²</dd>
                    </div>
                  )}
                  {locatie.persoanaContact && (
                    <div>
                      <dt className="text-gray-500">Responsabil</dt>
                      <dd className="mt-1">{locatie.persoanaContact}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Verificări */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-gray-400" />
                    Verificări ({locatie._count.verificari})
                  </CardTitle>
                  {canEdit && (
                    <Link href={`/verificari/nou?locatieId=${locatie.id}`} className="text-xs text-blue-600 hover:underline">
                      + Verificare nouă
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {locatie.verificari.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Nu există verificări pentru această locație.</p>
                ) : (
                  <div className="space-y-2">
                    {locatie.verificari.map(v => (
                      <Link
                        key={v.id}
                        href={`/verificari/${v.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{v.numar}</p>
                          <p className="text-xs text-gray-500">
                            {TIP_VERIFICARE_LABELS[v.tip]} · {formatDate(v.dataProgramata)}
                            {v.tehnician && ` · ${v.tehnician.prenume} ${v.tehnician.nume}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
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

          <div>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={locatie.status === 'ACTIVA' ? 'success' : 'secondary'}>
                    {locatie.status === 'ACTIVA' ? 'Activă' : locatie.status === 'INACTIVA' ? 'Inactivă' : 'În construcție'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cod intern</span>
                  <span className="font-mono text-xs">{locatie.cod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Înregistrată</span>
                  <span>{formatDate(locatie.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
