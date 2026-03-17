import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Download, Eye } from 'lucide-react'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Documente' }

const TIP_DOC_LABELS: Record<string, string> = {
  BULETIN_VERIFICARE: 'Buletin verificare',
  RAPORT_MASURATORI: 'Raport măsurători',
  CERTIFICAT_CONFORMITATE: 'Certificat conformitate',
  PROCES_VERBAL: 'Proces verbal',
  CONTRACT: 'Contract',
  OFERTA: 'Ofertă',
  FACTURA: 'Factură',
  ALTELE: 'Altele',
}

const STATUS_DOC_LABELS: Record<string, { label: string; variant: any }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  FINAL: { label: 'Final', variant: 'info' },
  SEMNAT: { label: 'Semnat', variant: 'success' },
  ARHIVAT: { label: 'Arhivat', variant: 'outline' },
}

export default async function DocumentePage() {
  const session = await getAuthSession()
  if (!['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session?.user?.role ?? '')) {
    redirect('/dashboard')
  }

  const documente = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { prenume: true, nume: true } },
      client: { select: { denumire: true } },
      verificare: { select: { numar: true } },
    },
    take: 50,
  })

  return (
    <div>
      <Header title="Documente" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Registru documente"
          description={`${documente.length} documente în arhivă`}
        />

        {/* Tip-based grouping */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(TIP_DOC_LABELS).map(([tip, label]) => {
            const count = documente.filter(d => d.tip === tip).length
            return (
              <div key={tip} className="rounded-lg border bg-white p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            )
          })}
        </div>

        {/* Documents list */}
        <Card>
          <CardContent className="p-0">
            {documente.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-gray-400">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Nu există documente în arhivă.</p>
                <p className="text-xs mt-1">Documentele sunt generate automat după finalizarea verificărilor.</p>
              </div>
            ) : (
              <div className="divide-y">
                {documente.map(doc => {
                  const statusCfg = STATUS_DOC_LABELS[doc.status] ?? { label: doc.status, variant: 'outline' }
                  return (
                    <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{doc.denumire}</p>
                        <p className="text-xs text-gray-500">
                          {TIP_DOC_LABELS[doc.tip] ?? doc.tip}
                          {doc.client && ` · ${doc.client.denumire}`}
                          {doc.verificare && ` · Verif. ${doc.verificare.numar}`}
                          {' · '}
                          {doc.creator.prenume} {doc.creator.nume}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                        <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
