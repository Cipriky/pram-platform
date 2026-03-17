'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const utilizatorSchema = z.object({
  prenume: z.string().min(2),
  nume: z.string().min(2),
  email: z.string().email('Email invalid'),
  password: z.string().min(8, 'Parola minim 8 caractere'),
  telefon: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TEHNICIAN', 'BACK_OFFICE', 'CLIENT']),
})

type UtilizatorFormValues = z.infer<typeof utilizatorSchema>

export function UtilizatorForm() {
  const router = useRouter()
  const { toast } = useToast()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UtilizatorFormValues>({
    resolver: zodResolver(utilizatorSchema),
    defaultValues: { role: 'TEHNICIAN' },
  })

  const onSubmit = async (data: UtilizatorFormValues) => {
    const res = await fetch('/api/utilizatori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Eroare', description: err.error, variant: 'destructive' })
      return
    }

    toast({ title: 'Utilizator creat cu succes!' })
    router.push('/tehnicieni')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Date cont</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prenume *</Label>
              <Input {...register('prenume')} />
              {errors.prenume && <p className="text-xs text-red-500">{errors.prenume.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nume *</Label>
              <Input {...register('nume')} />
              {errors.nume && <p className="text-xs text-red-500">{errors.nume.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Parolă *</Label>
            <Input type="password" {...register('password')} placeholder="Minim 8 caractere" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Telefon</Label>
            <Input {...register('telefon')} placeholder="ex: 0721 000 001" />
          </div>

          <div className="space-y-1.5">
            <Label>Rol *</Label>
            <Select defaultValue="TEHNICIAN" onValueChange={val => setValue('role', val as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrator</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="TEHNICIAN">Tehnician</SelectItem>
                <SelectItem value="BACK_OFFICE">Back-office</SelectItem>
                <SelectItem value="CLIENT">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>Creează cont</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Anulează</Button>
      </div>
    </form>
  )
}
