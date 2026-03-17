'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, CheckCircle2, XCircle, Trash2, Ruler, Pencil } from 'lucide-react'
import { masuratorieSchema, MasuratorieFormValues } from '@/lib/validations/verificare'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Masuratore {
  id: string
  tip: string
  denumire: string
  localizare: string | null
  valoareMasurata: number
  unitateMasura: string
  valoareAdmisa: number | null
  conformitate: boolean | null
  observatii: string | null
}

interface MasuratoriSectionProps {
  verificareId: string
  masuratori: Masuratore[]
  canEdit: boolean
}

const TIP_MASURATORE_OPTIONS = [
  { value: 'REZISTENTA_PRIZE_PAMANT', label: 'Rezistență priză de pământ', unitate: 'Ω' },
  { value: 'REZISTENTA_IZOLATIE', label: 'Rezistență izolație', unitate: 'MΩ' },
  { value: 'CONTINUITATE_CONDUCTOR_PROTECTIE', label: 'Continuitate conductor protecție PE', unitate: 'Ω' },
  { value: 'CURENT_FUGA', label: 'Curent de fugă', unitate: 'mA' },
  { value: 'TENSIUNE_ATINGERE', label: 'Tensiune de atingere', unitate: 'V' },
  { value: 'TENSIUNE_PAS', label: 'Tensiune de pas', unitate: 'V' },
  { value: 'IMPEDANTA_BUCLA_DEFECT', label: 'Impedanță buclă de defect', unitate: 'Ω' },
  { value: 'CURENT_SCURTCIRCUIT', label: 'Curent de scurtcircuit prezumat', unitate: 'kA' },
  { value: 'TIMP_ACTIONARE_DDR', label: 'Timp acționare DDR', unitate: 'ms' },
  { value: 'REZISTENTA_CONTACT', label: 'Rezistență de contact', unitate: 'mΩ' },
  { value: 'ALTELE', label: 'Altele', unitate: '' },
]

export function MasuratoriSection({ verificareId, masuratori, canEdit }: MasuratoriSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<MasuratorieFormValues>({
    resolver: zodResolver(masuratorieSchema),
    defaultValues: { unitateMasura: 'Ω' },
  })

  const tipSelectat = watch('tip')

  const onTipChange = (val: string) => {
    setValue('tip', val as any)
    const opt = TIP_MASURATORE_OPTIONS.find(o => o.value === val)
    if (opt?.unitate) setValue('unitateMasura', opt.unitate)
  }

  const openEdit = (m: Masuratore) => {
    setEditingId(m.id)
    reset({
      tip: m.tip as any,
      denumire: m.denumire,
      localizare: m.localizare ?? undefined,
      valoareMasurata: m.valoareMasurata,
      unitateMasura: m.unitateMasura,
      valoareAdmisa: m.valoareAdmisa ?? undefined,
      observatii: m.observatii ?? undefined,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    reset({ unitateMasura: 'Ω' })
  }

  const onSubmit = async (data: MasuratorieFormValues) => {
    const url = `/api/verificari/${verificareId}/masuratori`
    const method = editingId ? 'PUT' : 'POST'
    const body = editingId ? { masuratorieId: editingId, ...data } : data

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Eroare', description: err.error, variant: 'destructive' })
      return
    }

    toast({ title: editingId ? 'Măsurătoare actualizată!' : 'Măsurătoare adăugată!' })
    closeForm()
    router.refresh()
  }

  const deleteMasuratore = async (id: string) => {
    setDeleting(id)
    const res = await fetch(`/api/verificari/${verificareId}/masuratori?masuratorieId=${id}`, {
      method: 'DELETE',
    })
    setDeleting(null)
    if (res.ok) {
      toast({ title: 'Măsurătoare ștearsă' })
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gray-400" />
            Măsurători - Buletin ({masuratori.length})
          </CardTitle>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => { setEditingId(null); reset({ unitateMasura: 'Ω' }); setShowForm(!showForm) }}>
              <Plus className="h-4 w-4 mr-1" />
              Adaugă
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form adaugare / editare */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-800">
              {editingId ? 'Editează măsurătoare' : 'Măsurătoare nouă'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Tip *</Label>
                <Select value={tipSelectat} onValueChange={onTipChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selectează tipul..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIP_MASURATORE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tip && <p className="text-[10px] text-red-500">{errors.tip.message}</p>}
              </div>

              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Denumire punct de măsurare *</Label>
                <Input {...register('denumire')} placeholder="ex: Priză pământ tablou principal" className="h-8 text-xs" />
                {errors.denumire && <p className="text-[10px] text-red-500">{errors.denumire.message}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Localizare</Label>
                <Input {...register('localizare')} placeholder="ex: Tablou electric, et. 1" className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valoare măsurată *</Label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    step="any"
                    {...register('valoareMasurata', { valueAsNumber: true })}
                    className="h-8 text-xs"
                    placeholder="0.00"
                  />
                  <Input
                    {...register('unitateMasura')}
                    className="h-8 text-xs w-16"
                    placeholder="Ω"
                  />
                </div>
                {errors.valoareMasurata && <p className="text-[10px] text-red-500">{errors.valoareMasurata.message}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Valoare admisă</Label>
                <Input
                  type="number"
                  step="any"
                  {...register('valoareAdmisa', { valueAsNumber: true })}
                  className="h-8 text-xs"
                  placeholder="limita max"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Observații</Label>
                <Input {...register('observatii')} placeholder="observații opționale" className="h-8 text-xs" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs">
                {isSubmitting ? 'Se salvează...' : 'Salvează'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={closeForm} className="h-8 text-xs">
                Anulează
              </Button>
            </div>
          </form>
        )}

        {/* Lista măsurători */}
        {masuratori.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-400">
            <Ruler className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Nu există măsurători înregistrate.</p>
            {canEdit && (
              <button onClick={() => { setEditingId(null); setShowForm(true) }} className="text-xs text-blue-600 mt-1 hover:underline">
                Adaugă prima măsurătoare →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {masuratori.map(m => (
              <div
                key={m.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  m.conformitate === false ? 'border-red-200 bg-red-50' :
                  m.conformitate === true ? 'border-green-200 bg-green-50' : 'bg-white'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {m.conformitate === true ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : m.conformitate === false ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{m.denumire}</p>
                  {m.localizare && <p className="text-xs text-gray-500">{m.localizare}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold font-mono">
                      {m.valoareMasurata} {m.unitateMasura}
                    </span>
                    {m.valoareAdmisa && (
                      <span className="text-xs text-gray-400">
                        / admis: {m.valoareAdmisa} {m.unitateMasura}
                      </span>
                    )}
                  </div>
                  {m.observatii && <p className="text-xs text-gray-500 mt-1 italic">{m.observatii}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-[10px]">
                    {TIP_MASURATORE_OPTIONS.find(o => o.value === m.tip)?.label ?? m.tip}
                  </Badge>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => openEdit(m)}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                        title="Editează"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMasuratore(m.id)}
                        disabled={deleting === m.id}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        title="Șterge"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
