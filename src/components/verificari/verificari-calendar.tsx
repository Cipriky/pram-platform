'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

type Verificare = {
  id: string
  numar: string
  dataProgramata: string | Date | null
  status: string
  locatie: { denumire: string; client: { denumire: string } }
  tehnician: { id: string; prenume: string; nume: string } | null
}

const STATUS_COLOR: Record<string, string> = {
  PROGRAMATA: 'bg-blue-500',
  IN_DESFASURARE: 'bg-amber-500',
  FINALIZATA: 'bg-green-500',
  AMANATA: 'bg-purple-500',
  ANULATA: 'bg-red-400',
}
const STATUS_LABEL: Record<string, string> = {
  PROGRAMATA: 'Programată',
  IN_DESFASURARE: 'În desfășurare',
  FINALIZATA: 'Finalizată',
  AMANATA: 'Amânată',
  ANULATA: 'Anulată',
}

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
const ZILE = ['Lun','Mar','Mie','Joi','Vin','Sâm','Dum']

export function VerificariCalendar({ verificari, tehnicieni }: {
  verificari: Verificare[]
  tehnicieni: { id: string; prenume: string; nume: string }[]
}) {
  const azi = new Date()
  const [luna, setLuna] = useState(azi.getMonth())
  const [an, setAn] = useState(azi.getFullYear())
  const [filtruStatus, setFiltruStatus] = useState('toate')
  const [filtruTehnician, setFiltruTehnician] = useState('toti')
  const [ziSelectata, setZiSelectata] = useState<string | null>(null)

  const navigheaza = (dir: number) => {
    setZiSelectata(null)
    const d = new Date(an, luna + dir, 1)
    setLuna(d.getMonth())
    setAn(d.getFullYear())
  }

  // Filtrează verificările
  const verificariFiltrate = useMemo(() => verificari.filter(v => {
    if (filtruStatus !== 'toate' && v.status !== filtruStatus) return false
    if (filtruTehnician !== 'toti' && v.tehnician?.id !== filtruTehnician) return false
    return true
  }), [verificari, filtruStatus, filtruTehnician])

  // Grupează pe zile (cheie: "yyyy-mm-dd")
  const peZi = useMemo(() => {
    const map: Record<string, Verificare[]> = {}
    for (const v of verificariFiltrate) {
      if (!v.dataProgramata) continue
      const d = new Date(v.dataProgramata)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      if (!map[key]) map[key] = []
      map[key].push(v)
    }
    return map
  }, [verificariFiltrate])

  // Construiește gridul calendarului
  const primaZiLuna = new Date(an, luna, 1)
  // luni=0 → zi 1 (ISO: Lun=1), ajustăm astfel încât Lun = index 0
  const offsetZiSaptamana = (primaZiLuna.getDay() + 6) % 7
  const zileLuna = new Date(an, luna + 1, 0).getDate()
  const totalCelule = Math.ceil((offsetZiSaptamana + zileLuna) / 7) * 7

  const celule: (number | null)[] = []
  for (let i = 0; i < totalCelule; i++) {
    const zi = i - offsetZiSaptamana + 1
    celule.push(zi >= 1 && zi <= zileLuna ? zi : null)
  }

  const cheieZi = (zi: number) =>
    `${an}-${String(luna+1).padStart(2,'0')}-${String(zi).padStart(2,'0')}`

  const eAzi = (zi: number) =>
    zi === azi.getDate() && luna === azi.getMonth() && an === azi.getFullYear()

  const verificariZiSelectata = ziSelectata ? (peZi[ziSelectata] ?? []) : []

  // Statele lunii curente (pentru sumarul de sus)
  const verificariLuna = useMemo(() => {
    return verificariFiltrate.filter(v => {
      if (!v.dataProgramata) return false
      const d = new Date(v.dataProgramata)
      return d.getMonth() === luna && d.getFullYear() === an
    })
  }, [verificariFiltrate, luna, an])

  return (
    <div className="space-y-4">
      {/* Filtre */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filtruStatus}
          onChange={e => { setFiltruStatus(e.target.value); setZiSelectata(null) }}
          className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="toate">Toate statusurile</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {tehnicieni.length > 0 && (
          <select
            value={filtruTehnician}
            onChange={e => { setFiltruTehnician(e.target.value); setZiSelectata(null) }}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="toti">Toți tehnicienii</option>
            {tehnicieni.map(t => (
              <option key={t.id} value={t.id}>{t.prenume} {t.nume}</option>
            ))}
          </select>
        )}

        <div className="ml-auto flex items-center gap-1">
          {Object.entries(STATUS_COLOR).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1 text-xs text-gray-500 mr-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${c}`} />
              {STATUS_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      {/* Sumar lunar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="col-span-2 md:col-span-1 rounded-xl border bg-gray-50 p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{verificariLuna.length}</p>
          <p className="text-xs text-gray-500">Total luna aceasta</p>
        </div>
        {['PROGRAMATA','IN_DESFASURARE','FINALIZATA','AMANATA'].map(s => (
          <div key={s} className="rounded-xl border p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {verificariLuna.filter(v => v.status === s).length}
            </p>
            <p className="text-xs text-gray-500">{STATUS_LABEL[s]}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        {/* Header navigare */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <button
            onClick={() => navigheaza(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            {LUNI[luna]} {an}
          </h2>
          <button
            onClick={() => navigheaza(1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Zilele săptămânii */}
        <div className="grid grid-cols-7 border-b">
          {ZILE.map(z => (
            <div key={z} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {z}
            </div>
          ))}
        </div>

        {/* Grilă zile */}
        <div className="grid grid-cols-7">
          {celule.map((zi, idx) => {
            if (!zi) return (
              <div key={idx} className="min-h-[80px] border-b border-r bg-gray-50/50 last:border-r-0" />
            )
            const cheie = cheieZi(zi)
            const vZi = peZi[cheie] ?? []
            const eSelectata = ziSelectata === cheie
            return (
              <div
                key={idx}
                onClick={() => setZiSelectata(eSelectata ? null : cheie)}
                className={`min-h-[80px] border-b border-r last:border-r-0 p-1.5 cursor-pointer transition-colors ${
                  eSelectata ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' :
                  vZi.length > 0 ? 'hover:bg-gray-50' : 'hover:bg-gray-50/70'
                }`}
              >
                <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  eAzi(zi)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700'
                }`}>
                  {zi}
                </div>
                <div className="space-y-0.5">
                  {vZi.slice(0, 3).map(v => (
                    <div
                      key={v.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate ${STATUS_COLOR[v.status] ?? 'bg-gray-400'}`}
                      title={`${v.numar} — ${v.locatie.client.denumire}`}
                    >
                      {v.locatie.client.denumire}
                    </div>
                  ))}
                  {vZi.length > 3 && (
                    <div className="text-[10px] text-gray-500 pl-1">+{vZi.length - 3} mai multe</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detalii zi selectată */}
      {ziSelectata && verificariZiSelectata.length > 0 && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Verificări pe {new Date(ziSelectata + 'T12:00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <div className="space-y-2">
            {verificariZiSelectata.map(v => (
              <Link
                key={v.id}
                href={`/verificari/${v.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${STATUS_COLOR[v.status] ?? 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600">{v.numar}</p>
                  <p className="text-xs text-gray-500 truncate">{v.locatie.client.denumire} — {v.locatie.denumire}</p>
                  {v.tehnician && (
                    <p className="text-xs text-gray-400 mt-0.5">{v.tehnician.prenume} {v.tehnician.nume}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0 ${STATUS_COLOR[v.status] ?? 'bg-gray-400'}`}>
                  {STATUS_LABEL[v.status] ?? v.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {ziSelectata && verificariZiSelectata.length === 0 && (
        <div className="rounded-xl border bg-gray-50 p-4 text-center text-sm text-gray-400">
          Nicio verificare programată în ziua selectată (cu filtrele aplicate).
        </div>
      )}
    </div>
  )
}
