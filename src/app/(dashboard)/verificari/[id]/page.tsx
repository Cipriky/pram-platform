import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, MapPin, User, Calendar, Clock, CheckCircle2,
  AlertTriangle, FileText, Wrench, Camera, ClipboardList, Printer
} from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate, formatDateTime, TIP_VERIFICARE_LABELS } from '@/lib/utils'
import { VerificareActiuni } from '@/components/verificari/verificare-actiuni'
import { MasuratoriSection } from '@/components/verificari/masuratori-section'
import { MasuratoriAnexe } from '@/components/verificari/masuratori-anexe'
import { PhotoUpload } from '@/components/shared/photo-upload'
import { UmiditateSelector } from '@/components/verificari/umiditate-selector'

export const metadata: Metadata = { title: 'Detalii verificare' }

export default async function VerificareDetailPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return null

  const verificare = await prisma.verificare.findUnique({
    where: { id: params.id },
    include: {
      locatie: { include: { client: true } },
      tehnician: { select: { id: true, prenume: true, nume: true, email: true, telefon: true } },
      creator: { select: { prenume: true, nume: true } },
      masuratori: { orderBy: { createdAt: 'asc' } },
      continuitateAnexe: { orderBy: { createdAt: 'asc' } },
      poze: { orderBy: { pozitie: 'asc' } },
      aparate: { include: { aparat: true } },
      documente: true,
    },
  })

  if (!verificare) notFound()

  // Tehnicianul vede doar verificările lui
  if (session.user.role === 'TEHNICIAN' && verificare.tehnicianId !== session.user.id) {
    notFound()
  }

  const canEdit = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role) ||
    (session.user.role === 'TEHNICIAN' && verificare.tehnicianId === session.user.id && verificare.status !== 'FINALIZATA')

  const masuratoriFailed = verificare.masuratori.filter(m => m.conformitate === false)
  const masuratoriOk = verificare.masuratori.filter(m => m.conformitate === true)

  return (
    <div>
      <Header title={verificare.numar} />
      <div className="p-6 space-y-6">
        <PageHeader
          title={verificare.numar}
          description={`${TIP_VERIFICARE_LABELS[verificare.tip]} · ${verificare.locatie.denumire}`}
        >
          <Link href="/verificari">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
          {verificare.status === 'FINALIZATA' && (
            <a href={`/api/verificari/${verificare.id}/document`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Buletin verificare
              </Button>
            </a>
          )}
          {canEdit && verificare.status !== 'FINALIZATA' && verificare.status !== 'ANULATA' && (
            <Link href={`/verificari/${verificare.id}/editeaza`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editează
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Status banner */}
        <div className="flex items-center gap-4 rounded-xl border bg-white p-4">
          <StatusVerificareBadge status={verificare.status} />
          {verificare.rezultat && <RezultatVerificareBadge rezultat={verificare.rezultat} />}
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(verificare.dataProgramata)}</span>
          </div>
          {verificare.dataFinalizare && (
            <>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Finalizată: {formatDateTime(verificare.dataFinalizare)}</span>
              </div>
            </>
          )}
          <div className="ml-auto">
            <VerificareActiuni
              verificareId={verificare.id}
              status={verificare.status}
              userRole={session.user.role}
              tehnicianId={verificare.tehnicianId ?? undefined}
              userId={session.user.id}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Locație și client */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Locație verificată
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Client</p>
                    <Link href={`/clienti/${verificare.locatie.client.id}`} className="font-semibold text-blue-600 hover:underline">
                      {verificare.locatie.client.denumire}
                    </Link>
                    <p className="text-xs text-gray-400">{verificare.locatie.client.cod}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Locație</p>
                    <Link href={`/locatii/${verificare.locatieId}`} className="font-semibold text-blue-600 hover:underline">
                      {verificare.locatie.denumire}
                    </Link>
                  </div>
                  <div>
                    <p className="text-gray-500">Adresă</p>
                    <p className="font-medium">{verificare.locatie.adresa}</p>
                    <p className="text-xs text-gray-400">{verificare.locatie.oras}, jud. {verificare.locatie.judet}</p>
                  </div>
                  {verificare.locatie.persoanaContact && (
                    <div>
                      <p className="text-gray-500">Contact la locație</p>
                      <p className="font-medium">{verificare.locatie.persoanaContact}</p>
                      <p className="text-xs text-gray-400">{verificare.locatie.telefonContact}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Măsurători - Buletin */}
            <MasuratoriSection
              verificareId={verificare.id}
              masuratori={verificare.masuratori}
              canEdit={canEdit && verificare.status !== 'FINALIZATA' && verificare.status !== 'ANULATA'}
            />

            {/* Măsurători - Anexe */}
            <MasuratoriAnexe
              verificareId={verificare.id}
              items={verificare.continuitateAnexe}
              canEdit={canEdit && verificare.status !== 'FINALIZATA' && verificare.status !== 'ANULATA'}
            />

            {/* Umiditate sol */}
            {canEdit && verificare.status !== 'FINALIZATA' && verificare.status !== 'ANULATA' && (
              <UmiditateSelector
                verificareId={verificare.id}
                observatiiTerenInitiale={verificare.observatiiTeren ?? null}
                canEdit={canEdit}
              />
            )}

            {/* Fotografii */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-400" />
                  Fotografii din teren
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  verificareId={verificare.id}
                  initialPoze={verificare.poze}
                  canEdit={canEdit && verificare.status !== 'FINALIZATA' && verificare.status !== 'ANULATA'}
                />
              </CardContent>
            </Card>

            {/* Concluzii */}
            {(verificare.observatiiTeren || verificare.concluzii || verificare.recomandari) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-gray-400" />
                    Concluzii și recomandări
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {verificare.observatiiTeren && (
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Observații teren</p>
                      <p className="text-gray-600 leading-relaxed">{verificare.observatiiTeren}</p>
                    </div>
                  )}
                  {verificare.concluzii && (
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Concluzii</p>
                      <p className="text-gray-600 leading-relaxed">{verificare.concluzii}</p>
                    </div>
                  )}
                  {verificare.recomandari && (
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Recomandări</p>
                      <p className="text-gray-600 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-3">
                        {verificare.recomandari}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tehnician */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  Tehnician
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificare.tehnician ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {verificare.tehnician.prenume.charAt(0)}{verificare.tehnician.nume.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{verificare.tehnician.prenume} {verificare.tehnician.nume}</p>
                      <p className="text-xs text-gray-500">{verificare.tehnician.email}</p>
                      {verificare.tehnician.telefon && (
                        <p className="text-xs text-gray-500">{verificare.tehnician.telefon}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Neatribuit</p>
                )}
              </CardContent>
            </Card>

            {/* Statistici măsurători */}
            {verificare.masuratori.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sumar măsurători</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total</span>
                    <Badge variant="secondary">{verificare.masuratori.length}</Badge>
                  </div>
                  {masuratoriOk.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Conforme
                      </span>
                      <Badge variant="success">{masuratoriOk.length}</Badge>
                    </div>
                  )}
                  {masuratoriFailed.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Neconforme
                      </span>
                      <Badge variant="destructive">{masuratoriFailed.length}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Aparate folosite */}
            {verificare.aparate.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    Aparate folosite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {verificare.aparate.map(va => (
                    <div key={va.id} className="text-xs">
                      <p className="font-medium">{va.aparat.denumire}</p>
                      <p className="text-gray-400">{va.aparat.producator} {va.aparat.model}</p>
                      <p className="text-gray-400 font-mono">{va.aparat.serieNumar}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Documente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Documente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificare.documente.length === 0 ? (
                  <p className="text-xs text-gray-400">Niciun document generat.</p>
                ) : (
                  <div className="space-y-2">
                    {verificare.documente.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 text-xs">
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
                          >
                            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                            {doc.denumire}
                          </a>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{doc.denumire}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info creat de */}
            <Card>
              <CardContent className="pt-4 text-xs text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Creat de</span>
                  <span className="font-medium text-gray-700">{verificare.creator.prenume} {verificare.creator.nume}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data creare</span>
                  <span>{formatDate(verificare.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ultima actualizare</span>
                  <span>{formatDateTime(verificare.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
