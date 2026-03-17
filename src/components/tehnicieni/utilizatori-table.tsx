'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { RoleBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'

type UtilizatorRow = {
  id: string
  email: string
  nume: string
  prenume: string
  telefon: string | null
  role: string
  status: string
  createdAt: Date
  _count: { verificariAlocate: number }
}

export function UtilizatoriTable({ data }: { data: UtilizatorRow[] }) {
  const router = useRouter()

  const rows = data.map(u => ({ ...u, numComplet: `${u.prenume} ${u.nume}` }))

  return (
    <DataTable
      data={rows}
      searchKey="email"
      searchPlaceholder="Caută după email..."
      onRowClick={(row) => router.push(`/tehnicieni/${row.id}`)}
      columns={[
        {
          key: 'numComplet',
          title: 'Nume',
          render: (_val, row: any) => (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-xs">
                {row.prenume.charAt(0)}{row.nume.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{row.prenume} {row.nume}</p>
                <p className="text-xs text-gray-400">{row.email}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'role',
          title: 'Rol',
          render: (val) => <RoleBadge role={val} />,
        },
        {
          key: 'telefon',
          title: 'Telefon',
          render: (val) => <span className="text-sm">{val ?? '-'}</span>,
        },
        {
          key: 'status',
          title: 'Status',
          render: (val) => (
            <Badge variant={val === 'ACTIV' ? 'success' : 'secondary'}>
              {val === 'ACTIV' ? 'Activ' : val === 'INACTIV' ? 'Inactiv' : 'Suspendat'}
            </Badge>
          ),
        },
        {
          key: 'createdAt',
          title: 'Creat',
          render: (val) => <span className="text-xs text-gray-400">{formatDate(val)}</span>,
        },
      ]}
    />
  )
}
