'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Droplets, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface UmiditateProps {
  verificareId: string
  observatiiTerenInitiale: string | null
  canEdit: boolean
}

const OPTIONS = [
  { value: 'uscat', label: 'Uscat', desc: 'Rezistivitate ridicată' },
  { value: 'umed', label: 'Umed', desc: 'Condiții normale' },
  { value: 'foarte_uscat', label: 'Foarte uscat', desc: 'Rezistivitate foarte ridicată' },
]

function extractUmiditate(observatii: string | null): string {
  if (!observatii) return ''
  const m = observatii.match(/^\[Umiditate: ([^\]]+)\]/)
  return m ? m[1] : ''
}

function buildObservatii(umiditate: string, restObservatii: string): string {
  if (!umiditate) return restObservatii
  return `[Umiditate: ${umiditate}]${restObservatii ? '\n' + restObservatii : ''}`
}

function stripUmiditate(observatii: string | null): string {
  if (!observatii) return ''
  return observatii.replace(/^\[Umiditate: [^\]]+\]\n?/, '').trim()
}

export function UmiditateSelector({ verificareId, observatiiTerenInitiale, canEdit }: UmiditateProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<string>(extractUmiditate(observatiiTerenInitiale))
  const [saving, setSaving] = useState(false)

  const save = async (value: string) => {
    if (!canEdit) return
    setSaving(true)
    setSelected(value)

    const restObservatii = stripUmiditate(observatiiTerenInitiale)
    const noileObservatii = buildObservatii(value, restObservatii)

    const res = await fetch(`/api/verificari/${verificareId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observatiiTeren: noileObservatii }),
    })

    setSaving(false)
    if (res.ok) {
      toast({ title: `Umiditate sol: ${OPTIONS.find(o => o.value === value)?.label}` })
      router.refresh()
    } else {
      toast({ title: 'Eroare la salvare', variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          Umiditate sol
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 mb-3">
          Aprecierea stării solului la momentul măsurătorii — apare pe buletinul PRAM
        </p>
        <div className="grid grid-cols-3 gap-3">
          {OPTIONS.map(opt => {
            const isSelected = selected === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!canEdit || saving}
                onClick={() => save(opt.value)}
                className={`rounded-xl border-2 p-3 text-center transition-all text-left
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'}
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                {isSelected && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                    ✓ Selectat
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
