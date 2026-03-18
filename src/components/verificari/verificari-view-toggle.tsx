'use client'

import { useState } from 'react'
import Link from 'next/link'
import { List, Calendar } from 'lucide-react'
import { StatusVerificareBadge, RezultatVerificareBadge } from '@/components/shared/status-badge'
import { formatDate, TIP_VERIFICARE_LABELS } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { VerificariCalendar } from './verificari-calendar'

type Verificare = {
  id: string
  numar: string
  dataProgramata: string | Date | null
  status: string
  rezultat: string | null
  tip: string
  locatie: { denumire: string; client: { denumire: string; cod: string } }
  tehnician: { id?: string; prenume: string; nume: string } | null
  _count: { masuratori: number; poze: number }
}

export function VerificariViewToggle({ verificari, tehnicieni, canCreate }: {
  verificari: Verificare[]
  tehnicieni: { id: string; prenume: string; nume: string }[]
  canCreate: boolean
}) {
  const [view, setView] = useState<'lista' | 'calendar'>('lista')

  return (
    <div className="space-y-4">
      {/* Toggle butoane */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setView('lista')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'lista'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List className="h-4 w-4" />
          Listă
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'calendar'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </button>
      </div>

      {/* Vizualizare Listă */}
      {view === 'lista' && (
        <Card>
          <CardContent className="p-0">
            {verificari.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <p className="text-sm">Nu există verificări.</p>
                {canCreate && (
                  <Link href="/verificari/nou" className="mt-2 text-sm text-blue-600 hover:underline">
                    Programează prima verificare →
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {verificari.map(v => (
                  <Link
                    key={v.id}
                    href={`/verificari/${v.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`h-10 w-1 rounded-full flex-shrink-0 ${
                      v.status === 'FINALIZATA' ? 'bg-green-400' :
                      v.status === 'IN_DESFASURARE' ? 'bg-amber-400' :
                      v.status === 'ANULATA' ? 'bg-red-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{v.numar}</span>
                        <span className="text-gray-400 text-sm">—</span>
                        <span className="font-medium text-gray-800 text-sm truncate">{v.locatie.denumire}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{v.locatie.client.denumire}</span>
                        <span>·</span>
                        <span>{TIP_VERIFICARE_LABELS[v.tip] ?? v.tip}</span>
                        <span>·</span>
                        <span>{formatDate(v.dataProgramata)}</span>
                        {v.tehnician && (
                          <>
                            <span>·</span>
                            <span>{v.tehnician.prenume} {v.tehnician.nume}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-xs text-gray-400">
                      <span>{v._count.masuratori} măs.</span>
                      <span>{v._count.poze} poze</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusVerificareBadge status={v.status as any} />
                      {v.rezultat && <RezultatVerificareBadge rezultat={v.rezultat as any} />}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vizualizare Calendar */}
      {view === 'calendar' && (
        <VerificariCalendar verificari={verificari as any} tehnicieni={tehnicieni} />
      )}
    </div>
  )
}
