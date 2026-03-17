'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { StatusClientBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'

type ClientRow = {
  id: string
  cod: string
  denumire: string
  cui: string | null
  tip: string
  oras: string | null
  judet: string | null
  status: string
  createdAt: Date
  _count: { locatii: number }
}

const TIP_LABELS: Record<string, string> = {
  PERSOANA_JURIDICA: 'Persoană juridică',
  PERSOANA_FIZICA: 'Persoană fizică',
  INSTITUTIE_PUBLICA: 'Instituție publică',
}

export function ClientiTable({ data }: { data: ClientRow[] }) {
  const router = useRouter()

  return (
    <DataTable
      data={data}
      searchKey="denumire"
      searchPlaceholder="Caută după denumire..."
      emptyMessage="Nu există clienți înregistrați."
      onRowClick={(row) => router.push(`/clienti/${row.id}`)}
      columns={[
        {
          key: 'cod',
          title: 'Cod',
          render: (val) => (
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{val}</span>
          ),
        },
        {
          key: 'denumire',
          title: 'Denumire',
          render: (val, row) => (
            <div>
              <p className="font-medium text-gray-900">{val}</p>
              <p className="text-xs text-gray-500">{row.cui ?? 'Fără CUI'}</p>
            </div>
          ),
        },
        {
          key: 'tip',
          title: 'Tip',
          render: (val) => <span className="text-sm text-gray-600">{TIP_LABELS[val] ?? val}</span>,
        },
        {
          key: 'oras',
          title: 'Localitate',
          render: (val, row) => (
            <span className="text-sm">{val ?? '-'}{row.judet ? `, ${row.judet}` : ''}</span>
          ),
        },
        {
          key: '_count',
          title: 'Locații',
          render: (val) => <Badge variant="secondary">{val.locatii} locații</Badge>,
        },
        {
          key: 'status',
          title: 'Status',
          render: (val) => <StatusClientBadge status={val} />,
        },
        {
          key: 'createdAt',
          title: 'Înregistrat',
          render: (val) => <span className="text-xs text-gray-500">{formatDate(val)}</span>,
        },
      ]}
    />
  )
}
