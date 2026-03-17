'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, ClientFormValues } from '@/lib/validations/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { JUDET_OPTIONS } from '@/lib/utils'

interface ClientFormProps {
  defaultValues?: Partial<ClientFormValues>
  clientId?: string
}

export function ClientForm({ defaultValues, clientId }: ClientFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tip: 'PERSOANA_JURIDICA',
      status: 'ACTIV',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: ClientFormValues) => {
    const url = clientId ? `/api/clienti/${clientId}` : '/api/clienti'
    const method = clientId ? 'PUT' : 'POST'

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
    toast({ title: 'Succes!', description: clientId ? 'Clientul a fost actualizat.' : 'Clientul a fost creat.', variant: 'default' as any })
    router.push(`/clienti/${result.id ?? clientId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Date principale */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date principale</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="denumire">Denumire *</Label>
            <Input id="denumire" {...register('denumire')} placeholder="ex: ELECTROMOTOR SRL" />
            {errors.denumire && <p className="text-xs text-red-500">{errors.denumire.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tip client *</Label>
            <Select
              defaultValue={defaultValues?.tip ?? 'PERSOANA_JURIDICA'}
              onValueChange={val => setValue('tip', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSOANA_JURIDICA">Persoană juridică</SelectItem>
                <SelectItem value="PERSOANA_FIZICA">Persoană fizică</SelectItem>
                <SelectItem value="INSTITUTIE_PUBLICA">Instituție publică</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="INACTIV">Inactiv</SelectItem>
                <SelectItem value="PROSPECT">Prospect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cui">CUI / CNP</Label>
            <Input id="cui" {...register('cui')} placeholder="ex: RO12345678" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nrRegCom">Nr. Reg. Comerțului</Label>
            <Input id="nrRegCom" {...register('nrRegCom')} placeholder="ex: J40/1234/2024" />
          </div>
        </CardContent>
      </Card>

      {/* Adresă */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Adresă</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="adresa">Stradă și număr</Label>
            <Input id="adresa" {...register('adresa')} placeholder="ex: Str. Industriilor nr. 15" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oras">Oraș</Label>
            <Input id="oras" {...register('oras')} placeholder="ex: București" />
          </div>
          <div className="space-y-1.5">
            <Label>Județ</Label>
            <Select
              defaultValue={defaultValues?.judet ?? ''}
              onValueChange={val => setValue('judet', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează județul" />
              </SelectTrigger>
              <SelectContent>
                {JUDET_OPTIONS.map(j => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="codPostal">Cod poștal</Label>
            <Input id="codPostal" {...register('codPostal')} placeholder="ex: 077040" />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date de contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="telefon">Telefon firmă</Label>
            <Input id="telefon" {...register('telefon')} placeholder="ex: 021 300 1001" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email firmă</Label>
            <Input id="email" type="email" {...register('email')} placeholder="ex: office@firma.ro" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} placeholder="ex: https://www.firma.ro" />
            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>

          <div className="md:col-span-2 border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Persoană de contact</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="persoanaContact">Nume și prenume</Label>
            <Input id="persoanaContact" {...register('persoanaContact')} placeholder="ex: Ion Popescu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefonContact">Telefon contact</Label>
            <Input id="telefonContact" {...register('telefonContact')} placeholder="ex: 0722 100 001" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emailContact">Email contact</Label>
            <Input id="emailContact" type="email" {...register('emailContact')} placeholder="ex: ion.popescu@firma.ro" />
            {errors.emailContact && <p className="text-xs text-red-500">{errors.emailContact.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Observatii */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Observații</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('observatii')}
            placeholder="Observații suplimentare despre client..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {clientId ? 'Salvează modificările' : 'Creează client'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Anulează
        </Button>
      </div>
    </form>
  )
}
