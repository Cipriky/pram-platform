import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Locații' }

export default async function LocatiiPage() {
  const session = await getAuthSession()

  const locatii = await prisma.locatie.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, denumire: true, cod: true } },
      _count: { select: { verificari: true } },
    },
  })

  const canCreate = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')

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
      <Header title="Locații" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Locații"
          description={`${locatii.length} locații gestionate`}
        >
          {canCreate && (
            <Link href="/locatii/nou">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Locație nouă
              </Button>
            </Link>
          )}
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {locatii.map(loc => (
            <Link key={loc.id} href={`/locatii/${loc.id}`}>
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{loc.denumire}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {loc.client.denumire}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {loc.adresa}, {loc.oras}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {tipLabels[loc.tip] ?? loc.tip}
                    </Badge>
                    <Badge
                      variant={loc.status === 'ACTIVA' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {loc.status === 'ACTIVA' ? 'Activă' : loc.status === 'INACTIVA' ? 'Inactivă' : 'În construcție'}
                    </Badge>
                    <span className="ml-auto text-xs text-gray-400">
                      {loc._count.verificari} verif.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {locatii.length === 0 && (
            <div className="col-span-3 flex flex-col items-center py-16 text-gray-400">
              <MapPin className="h-12 w-12 mb-3 opacity-30" />
              <p>Nu există locații înregistrate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
