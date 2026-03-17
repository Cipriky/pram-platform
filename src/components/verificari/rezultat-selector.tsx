'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface RezultatSelectorProps {
  verificareId: string
  rezultatInitial: string | null
  canEdit: boolean
}

const OPTIONS = [
  {
    value: 'ADMIS',
    label: 'Admis',
    desc: 'Instalația corespunde',
    selectedClass: 'border-green-500 bg-green-50',
    labelClass: 'text-green-700',
    badgeClass: 'text-green-600 bg-green-100',
  },
  {
    value: 'ADMIS_CU_REZERVE',
    label: 'Admis cu rezerve',
    desc: 'Cu observații',
    selectedClass: 'border-yellow-500 bg-yellow-50',
    labelClass: 'text-yellow-700',
    badgeClass: 'text-yellow-600 bg-yellow-100',
  },
  {
    value: 'RESPINS',
    label: 'Respins',
    desc: 'Instalație neconformă',
    selectedClass: 'border-red-500 bg-red-50',
    labelClass: 'text-red-700',
    badgeClass: 'text-red-600 bg-red-100',
  },
  {
    value: 'IN_ASTEPTARE',
    label: 'În așteptare',
    desc: 'Neevaluat',
    selectedClass: 'border-gray-400 bg-gray-50',
    labelClass: 'text-gray-600',
    badgeClass: 'text-gray-500 bg-gray-100',
  },
]

export function RezultatSelector({ verificareId, rezultatInitial, canEdit }: RezultatSelectorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<string>(rezultatInitial ?? '')
  const [saving, setSaving] = useState(false)

  const save = async (value: string) => {
    if (!canEdit) return
    setSaving(true)
    setSelected(value)

    const res = await fetch(`/api/verificari/${verificareId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rezultat: value }),
    })

    setSaving(false)
    if (res.ok) {
      toast({ title: `Rezultat: ${OPTIONS.find(o => o.value === value)?.label}` })
      router.refresh()
    } else {
      toast({ title: 'Eroare la salvare', variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-gray-400" />
          Rezultat verificare
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map(opt => {
            const isSelected = selected === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!canEdit || saving}
                onClick={() => save(opt.value)}
                className={`rounded-xl border-2 p-2.5 text-left transition-all
                  ${isSelected ? opt.selectedClass + ' shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}
                  ${!canEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <p className={`font-semibold text-xs ${isSelected ? opt.labelClass : 'text-gray-700'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                {isSelected && (
                  <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${opt.badgeClass}`}>
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
