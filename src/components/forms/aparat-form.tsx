'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aparatMasuraSchema, AparatMasuraFormValues } from '@/lib/validations/aparat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface AparatFormProps {
  defaultValues?: Partial<AparatMasuraFormValues>
  aparatId?: string
}

export function AparatForm({ defaultValues, aparatId }: AparatFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<AparatMasuraFormValues>({
    resolver: zodResolver(aparatMasuraSchema),
    defaultValues: { status: 'ACTIV', ...defaultValues },
  })

  const onSubmit = async (data: AparatMasuraFormValues) => {
    const url = aparatId ? `/api/aparate/${aparatId}` : '/api/aparate'
    const method = aparatId ? 'PUT' : 'POST'

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
    toast({ title: 'Succes!', description: aparatId ? 'Aparat actualizat.' : `Aparatul ${result.cod} a fost înregistrat.` })
    router.push(`/aparate/${result.id ?? aparatId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date identificare</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="denumire">Denumire *</Label>
            <Input id="denumire" {...register('denumire')} placeholder="ex: Telurmetru digital" />
            {errors.denumire && <p className="text-xs text-red-500">{errors.denumire.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="producator">Producător *</Label>
            <Input id="producator" {...register('producator')} placeholder="ex: METREL, FLUKE" />
            {errors.producator && <p className="text-xs text-red-500">{errors.producator.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Model *</Label>
            <Input id="model" {...register('model')} placeholder="ex: MI 2124" />
            {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="serieNumar">Nr. serie *</Label>
            <Input id="serieNumar" {...register('serieNumar')} placeholder="ex: MI2124-00123" />
            {errors.serieNumar && <p className="text-xs text-red-500">{errors.serieNumar.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="anFabricatie">An fabricație</Label>
            <Input id="anFabricatie" type="number" {...register('anFabricatie', { valueAsNumber: true })} placeholder="ex: 2022" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              defaultValue={defaultValues?.status ?? 'ACTIV'}
              onValueChange={val => setValue('status', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIV">Activ</SelectItem>
                <SelectItem value="IN_SERVICE">În service</SelectItem>
                <SelectItem value="DEFECT">Defect</SelectItem>
                <SelectItem value="CASSAT">Casat</SelectItem>
                <SelectItem value="INACTIV">Inactiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Etalonare metrologică</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dataAchizitie">Dată achiziție</Label>
            <Input id="dataAchizitie" type="date" {...register('dataAchizitie')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataUltimaEtalonare">Ultima etalonare</Label>
            <Input id="dataUltimaEtalonare" type="date" {...register('dataUltimaEtalonare')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataUrmatoareEtalonare">Următoarea etalonare</Label>
            <Input id="dataUrmatoareEtalonare" type="date" {...register('dataUrmatoareEtalonare')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="certificatEtalonare">Nr. certificat etalonare</Label>
            <Input id="certificatEtalonare" {...register('certificatEtalonare')} placeholder="ex: CET-2024-0045" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Observații</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...register('observatii')} rows={3} placeholder="Observații, defecte, reparații..." />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {aparatId ? 'Salvează' : 'Înregistrează aparatul'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Anulează</Button>
      </div>
    </form>
  )
}
