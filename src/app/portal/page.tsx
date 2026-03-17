import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'
import { MapPin, ClipboardCheck, FileText, Zap, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function PortalPage() {
  const session = await getAuthSession()

  if (!session) redirect('/login')
  if (session.user.role !== 'CLIENT') redirect('/dashboard')

  if (!session.user.clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Contul dvs. nu este asociat unui client. Contactați administratorul.</p>
      </div>
    )
  }

  const client = await prisma.client.findUnique({
    where: { id: session.user.clientId },
    include: {
      locatii: {
        include: {
          _count: { select: { verificari: true } },
        },
      },
    },
  })

  const verificariRecente = await prisma.verificare.findMany({
    where: { locatie: { clientId: session.user.clientId } },
    take: 10,
    orderBy: { dataProgramata: 'desc' },
    include: {
      locatie: { select: { denumire: true } },
      tehnician: { select: { prenume: true, nume: true } },
      _count: { select: { documente: true } },
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header portal */}
      <header className="bg-gray-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold">Portal Client — PRAM</p>
              <p className="text-xs text-gray-400">{client?.denumire}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">{session.user.name}</span>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Ieșire
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bun venit, {session.user.name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-1">Vedeți starea verificărilor PRAM pentru {client?.denumire}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{client?.locatii.length}</p>
              <p className="text-sm text-gray-500 mt-1">Locații</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold text-green-600">
                {verificariRecente.filter(v => v.status === 'FINALIZATA').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Verificări finalizate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {verificariRecente.filter(v => v.status === 'PROGRAMATA').length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Programate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verificări */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-gray-400" />
                  Verificările dvs. recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificariRecente.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">
                    Nu există verificări programate momentan.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {verificariRecente.map(v => (
                      <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                        <div className={`h-8 w-1 rounded-full flex-shrink-0 mt-1 ${
                          v.status === 'FINALIZATA' ? 'bg-green-400' :
                          v.status === 'IN_DESFASURARE' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{v.numar} — {v.locatie.denumire}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(v.dataProgramata)}
                            {v.tehnician && ` · Teh. ${v.tehnician.prenume} ${v.tehnician.nume}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusVerificareBadge status={v.status} />
                          {v.rezultat && <RezultatVerificareBadge rezultat={v.rezultat} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Locații */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Locațiile dvs.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client?.locatii.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{loc.denumire}</p>
                      <p className="text-xs text-gray-400">{loc.oras}</p>
                    </div>
                    <span className="text-xs text-gray-500">{loc._count.verificari} verif.</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} PRAM Platform · Portal Client
        </p>
      </main>
    </div>
  )
}
