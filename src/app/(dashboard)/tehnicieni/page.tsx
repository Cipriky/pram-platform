import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import { UtilizatoriTable } from '@/components/tehnicieni/utilizatori-table'

export const metadata: Metadata = { title: 'Tehnicieni & Utilizatori' }

export default async function TehnicieniiPage() {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER'].includes(session?.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const utilizatori = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      nume: true,
      prenume: true,
      telefon: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: { verificariAlocate: true },
      },
    },
  })

  const tehnicieni = utilizatori.filter(u => u.role === 'TEHNICIAN')
  const altiUtilizatori = utilizatori.filter(u => u.role !== 'TEHNICIAN')

  return (
    <div>
      <Header title="Echipă" />
      <div className="p-6 space-y-8">
        <PageHeader
          title="Echipă & Utilizatori"
          description={`${utilizatori.length} conturi active`}
        >
          {session?.user?.role === 'ADMIN' && (
            <Link href="/tehnicieni/nou">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Utilizator nou
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Tehnicieni cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Tehnicieni ({tehnicieni.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tehnicieni.map(t => (
              <Link key={t.id} href={`/tehnicieni/${t.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-lg">
                        {t.prenume.charAt(0)}{t.nume.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{t.prenume} {t.nume}</p>
                        <p className="text-xs text-gray-500">{t.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Badge variant={t.status === 'ACTIV' ? 'success' : 'secondary'}>
                        {t.status === 'ACTIV' ? 'Activ' : 'Inactiv'}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-auto">
                        {t._count.verificariAlocate} verificări
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {tehnicieni.length === 0 && (
              <div className="col-span-3 py-8 text-center text-gray-400 text-sm">
                Nu există tehnicieni înregistrați.
              </div>
            )}
          </div>
        </div>

        {/* Alți utilizatori */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Toți utilizatorii ({utilizatori.length})
          </h2>
          <UtilizatoriTable data={utilizatori} />
        </div>
      </div>
    </div>
  )
}
