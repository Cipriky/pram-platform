'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locatieSchema, LocatieFormValues } from '@/lib/validations/locatie'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { JUDET_OPTIONS } from '@/lib/utils'

interface LocatieFormProps {
  clienti: Array<{ id: string; denumire: string }>
  defaultValues?: Partial<LocatieFormValues>
  defaultClientId?: string
  locatieId?: string
}

export function LocatieForm({ clienti, defaultValues, defaultClientId, locatieId }: LocatieFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LocatieFormValues>({
    resolver: zodResolver(locatieSchema),
    defaultValues: {
      tip: 'PUNCT_DE_LUCRU',
      status: 'ACTIVA',
      clientId: defaultClientId ?? '',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: LocatieFormValues) => {
    const url = locatieId ? `/api/locatii/${locatieId}` : '/api/locatii'
    const method = locatieId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Eroare', description: err.error, variant: 'destructive' })
      return
    }

    const result = await res.json()
    toast({ title: 'Succes!', description: locatieId ? 'Locație actualizată.' : 'Locație creată.' })
    router.push(`/locatii/${result.id ?? locatieId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Date locație</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="clientId">Client *</Label>
            <Select
              defaultValue={defaultClientId ?? ''}
              onValueChange={val => setValue('clientId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează clientul..." />
              </SelectTrigger>
              <SelectContent>
                {clienti.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.denumire}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="denumire">Denumire locație *</Label>
            <Input id="denumire" {...register('denumire')} placeholder="ex: Hală Producție Nord" />
            {errors.denumire && <p className="text-xs text-red-500">{errors.denumire.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tip locație *</Label>
            <Select
              defaultValue={defaultValues?.tip ?? 'PUNCT_DE_LUCRU'}
              onValueChange={val => setValue('tip', val as any)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SEDIU_PRINCIPAL">Sediu principal</SelectItem>
                <SelectItem value="PUNCT_DE_LUCRU">Punct de lucru</SelectItem>
                <SelectItem value="DEPOZIT">Depozit</SelectItem>
                <SelectItem value="HALA_PRODUCTIE">Hală producție</SelectItem>
                <SelectItem value="BIROU">Birou</SelectItem>
                <SelectItem value="ALTELE">Altele</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              defaultValue={defaultValues?.status ?? 'ACTIVA'}
              onValueChange={val => setValue('status', val as any)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVA">Activă</SelectItem>
                <SelectItem value="INACTIVA">Inactivă</SelectItem>
                <SelectItem value="IN_CONSTRUCTIE">În construcție</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Adresă *</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="adresa">Stradă și număr *</Label>
            <Input id="adresa" {...register('adresa')} placeholder="ex: Str. Fabricii nr. 10" />
            {errors.adresa && <p className="text-xs text-red-500">{errors.adresa.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oras">Oraș *</Label>
            <Input id="oras" {...register('oras')} placeholder="ex: București" />
            {errors.oras && <p className="text-xs text-red-500">{errors.oras.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Județ *</Label>
            <Select
              defaultValue={defaultValues?.judet ?? ''}
              onValueChange={val => setValue('judet', val)}
            >
              <SelectTrigger><SelectValue placeholder="Selectează" /></SelectTrigger>
              <SelectContent>
                {JUDET_OPTIONS.map(j => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.judet && <p className="text-xs text-red-500">{errors.judet.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="codPostal">Cod poștal</Label>
            <Input id="codPostal" {...register('codPostal')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="suprafata">Suprafață (m²)</Label>
            <Input id="suprafata" type="number" {...register('suprafata', { valueAsNumber: true })} placeholder="ex: 500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Contact locație</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="persoanaContact">Responsabil locație</Label>
            <Input id="persoanaContact" {...register('persoanaContact')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefonContact">Telefon</Label>
            <Input id="telefonContact" {...register('telefonContact')} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="descriere">Descriere / Observații</Label>
            <Textarea id="descriere" {...register('descriere')} rows={3} placeholder="Detalii despre locație, acces, specificații tehnice..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {locatieId ? 'Salvează' : 'Creează locația'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Anulează</Button>
      </div>
    </form>
  )
}
