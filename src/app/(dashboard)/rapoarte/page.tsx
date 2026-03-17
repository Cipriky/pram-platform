'use client'

import { useEffect, useState } from 'react'
import { BarChart2, Users, CheckCircle2, AlertTriangle, TrendingUp, Download, MapPin, Wrench } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Stats = {
  general: {
    totalVerificari: number
    verificariFinalizate: number
    verificariAcestAn: number
    clientiActivi: number
    tehnicieni: number
    conformitate: number
  }
  topClienti: { id: string; denumire: string; cod: string; locatii: number; verificari: number }[]
  peJudet: { judet: string; total: number }[]
  peStatus: { status: string; total: number }[]
  peRezultat: { rezultat: string; total: number }[]
  peLuna: { luna: string; total: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  PROGRAMATA: 'Programate',
  IN_DESFASURARE: 'În desfășurare',
  FINALIZATA: 'Finalizate',
  ANULATA: 'Anulate',
  AMANATA: 'Amânate',
}
const STATUS_COLORS: Record<string, string> = {
  PROGRAMATA: 'bg-blue-500',
  IN_DESFASURARE: 'bg-yellow-500',
  FINALIZATA: 'bg-green-500',
  ANULATA: 'bg-red-500',
  AMANATA: 'bg-gray-400',
}
const REZ_LABELS: Record<string, string> = {
  ADMIS: 'Admise',
  ADMIS_CU_REZERVE: 'Admise cu rezerve',
  RESPINS: 'Respinse',
}
const REZ_COLORS: Record<string, string> = {
  ADMIS: 'bg-green-500',
  ADMIS_CU_REZERVE: 'bg-amber-500',
  RESPINS: 'bg-red-500',
}
const LUNA_LABELS: Record<string, string> = {
  '01': 'Ian', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'Mai', '06': 'Iun', '07': 'Iul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Noi', '12': 'Dec',
}

function formatLuna(yearMonth: string) {
  const [year, month] = yearMonth.split('-')
  return `${LUNA_LABELS[month] ?? month} ${year}`
}

export default function RapoartePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rapoarte/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const exportCSV = () => {
    if (!stats) return
    const rows = [
      ['Client', 'Cod', 'Locații', 'Verificări'],
      ...stats.topClienti.map(c => [c.denumire, c.cod, c.locatii, c.verificari]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `raport-pram-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div>
        <Header title="Rapoarte" />
        <div className="p-6 flex items-center justify-center h-64 text-gray-400">
          <BarChart2 className="h-8 w-8 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const { general } = stats
  const maxLuna = Math.max(...stats.peLuna.map(l => l.total), 1)
  const maxJudet = Math.max(...stats.peJudet.map(j => j.total), 1)
  const totalStatusuri = stats.peStatus.reduce((s, x) => s + x.total, 0)
  const totalRezultate = stats.peRezultat.reduce((s, x) => s + x.total, 0)

  return (
    <div>
      <Header title="Rapoarte" />
      <div className="p-6 space-y-8">
        <PageHeader title="Rapoarte & Statistici" description="Situație generală platformă">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </PageHeader>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Total verificări', value: general.totalVerificari, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Finalizate', value: general.verificariFinalizate, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Anul acesta', value: general.verificariAcestAn, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Clienți activi', value: general.clientiActivi, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Tehnicieni activi', value: general.tehnicieni, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Conformitate %', value: `${general.conformitate}%`, icon: general.conformitate >= 80 ? CheckCircle2 : AlertTriangle, color: general.conformitate >= 80 ? 'text-green-600' : 'text-amber-600', bg: general.conformitate >= 80 ? 'bg-green-50' : 'bg-amber-50' },
          ].map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grafic pe luni */}
        {stats.peLuna.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verificări pe luni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {stats.peLuna.map(l => (
                  <div key={l.luna} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{l.total}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all"
                      style={{ height: `${(l.total / maxLuna) * 100}px` }}
                    />
                    <span className="text-[10px] text-gray-400 rotate-[-30deg] origin-center w-8 text-center">
                      {formatLuna(l.luna)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Distribuție status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.peStatus.map(s => (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{STATUS_LABELS[s.status] ?? s.status}</span>
                    <span className="font-semibold">{s.total} ({Math.round((s.total / totalStatusuri) * 100)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-gray-400'}`}
                      style={{ width: `${(s.total / totalStatusuri) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rezultate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rezultate verificări finalizate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.peRezultat.length === 0 ? (
                <p className="text-sm text-gray-400">Nicio verificare finalizată.</p>
              ) : (
                stats.peRezultat.map(r => (
                  <div key={r.rezultat ?? 'null'}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{REZ_LABELS[r.rezultat ?? ''] ?? r.rezultat}</span>
                      <span className="font-semibold">{r.total} ({Math.round((r.total / totalRezultate) * 100)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${REZ_COLORS[r.rezultat ?? ''] ?? 'bg-gray-400'}`}
                        style={{ width: `${(r.total / totalRezultate) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Clienți */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top clienți după verificări</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topClienti.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <Link href={`/clienti/${c.id}`} className="font-medium text-sm text-blue-600 hover:underline">
                      {c.denumire}
                    </Link>
                    <p className="text-xs text-gray-400">{c.cod} · {c.locatii} locații</p>
                  </div>
                  <Badge variant="secondary">{c.verificari} verificări</Badge>
                </div>
              ))}
              {stats.topClienti.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">Nicio dată disponibilă.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pe județ */}
        {stats.peJudet.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Verificări pe județ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.peJudet.map(j => (
                  <div key={j.judet} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{j.judet}</span>
                      <span className="text-sm font-bold text-blue-600">{j.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-blue-400"
                        style={{ width: `${(j.total / maxJudet) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
