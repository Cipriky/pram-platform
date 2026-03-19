'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect } from 'react'
import { verificareSchema, VerificareFormValues } from '@/lib/validations/verificare'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ChevronDown, X } from 'lucide-react'

interface VerificareFormProps {
  locatii: Array<{
    id: string
    denumire: string
    oras: string
    client: { denumire: string }
  }>
  tehnicieni: Array<{
    id: string
    prenume: string
    nume: string
  }>
  defaultValues?: Partial<VerificareFormValues>
  verificareId?: string
}

export function VerificareForm({ locatii, tehnicieni, defaultValues, verificareId }: VerificareFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const defaultLoc = defaultValues?.locatieId ? locatii.find(l => l.id === defaultValues.locatieId) : null
  const [locSearch, setLocSearch] = useState(defaultLoc ? `${defaultLoc.denumire} — ${defaultLoc.client.denumire}` : '')
  const [locOpen, setLocOpen] = useState(false)
  const [locSelected, setLocSelected] = useState<string>(defaultValues?.locatieId ?? '')
  const locRef = useRef<HTMLDivElement>(null)

  const locatiiFiltrate = locatii.filter(loc => {
    const q = locSearch.toLowerCase()
    return (
      loc.denumire.toLowerCase().includes(q) ||
      loc.client.denumire.toLowerCase().includes(q) ||
      loc.oras.toLowerCase().includes(q)
    )
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<VerificareFormValues>({
    resolver: zodResolver(verificareSchema),
    defaultValues: {
      tip: 'VERIFICARE_PERIODICA',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: VerificareFormValues) => {
    const url = verificareId ? `/api/verificari/${verificareId}` : '/api/verificari'
    const method = verificareId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Eroare', description: err.error ?? 'A apărut o eroare.', variant: 'destructive' })
      return
    }

    const result = await res.json()
    toast({
      title: 'Succes!',
      description: verificareId ? 'Verificarea a fost actualizată.' : `Verificarea ${result.numar} a fost programată.`,
    })
    router.push(`/verificari/${result.id ?? verificareId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalii verificare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tip verificare *</Label>
            <Select
              defaultValue={defaultValues?.tip ?? 'VERIFICARE_PERIODICA'}
              onValueChange={val => setValue('tip', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERIFICARE_INITIALA">Verificare inițială</SelectItem>
                <SelectItem value="VERIFICARE_PERIODICA">Verificare periodică</SelectItem>
                <SelectItem value="VERIFICARE_DUPA_REPARATIE">Verificare după reparație</SelectItem>
                <SelectItem value="VERIFICARE_LA_CERERE">Verificare la cerere</SelectItem>
                <SelectItem value="RE_VERIFICARE">Re-verificare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5" ref={locRef}>
            <Label>Locație *</Label>
            <div className="relative">
              <div className="relative">
                <Input
                  value={locSearch}
                  onChange={e => { setLocSearch(e.target.value); setLocOpen(true) }}
                  onFocus={() => setLocOpen(true)}
                  placeholder="Caută după locație, client sau oraș..."
                  className="pr-8"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => { setLocSearch(''); setLocSelected(''); setValue('locatieId', ''); setLocOpen(true) }}
                >
                  {locSelected ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
              {locOpen && locatiiFiltrate.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
                  {locatiiFiltrate.map(loc => (
                    <button
                      key={loc.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${locSelected === loc.id ? 'bg-blue-50 font-medium' : ''}`}
                      onClick={() => {
                        setLocSelected(loc.id)
                        setValue('locatieId', loc.id)
                        setLocSearch(`${loc.denumire} — ${loc.client.denumire} (${loc.oras})`)
                        setLocOpen(false)
                      }}
                    >
                      <span className="font-medium">{loc.denumire}</span>
                      <span className="text-gray-500"> — {loc.client.denumire} · {loc.oras}</span>
                    </button>
                  ))}
                </div>
              )}
              {locOpen && locatiiFiltrate.length === 0 && locSearch && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg px-3 py-2 text-sm text-gray-500">
                  Nicio locație găsită
                </div>
              )}
            </div>
            {errors.locatieId && <p className="text-xs text-red-500">{errors.locatieId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tehnician alocat</Label>
            <Select
              defaultValue={defaultValues?.tehnicianId ?? 'none'}
              onValueChange={val => setValue('tehnicianId', val === 'none' ? null : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Neatribuit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Neatribuit —</SelectItem>
                {tehnicieni.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.prenume} {t.nume}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Programare</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="dataProgramata">Data și ora programate *</Label>
            <Input
              id="dataProgramata"
              type="datetime-local"
              {...register('dataProgramata')}
            />
            {errors.dataProgramata && <p className="text-xs text-red-500">{errors.dataProgramata.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="durataPlanificata">Durată estimată (minute)</Label>
            <Input
              id="durataPlanificata"
              type="number"
              min={30}
              max={1440}
              {...register('durataPlanificata', { valueAsNumber: true })}
              placeholder="ex: 180"
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="observatiiProgramare">Observații programare</Label>
            <Textarea
              id="observatiiProgramare"
              {...register('observatiiProgramare')}
              placeholder="Instrucțiuni sau detalii pentru tehnician..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {verificareId ? 'Salvează' : 'Programează verificarea'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Anulează
        </Button>
      </div>
    </form>
  )
}
