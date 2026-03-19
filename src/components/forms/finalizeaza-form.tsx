'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { SignatureCanvas } from '@/components/shared/signature-canvas'

const finalizeazaSchema = z.object({
  rezultat: z.enum(['ADMIS', 'RESPINS', 'ADMIS_CU_REZERVE']),
  observatiiTeren: z.string().optional(),
  concluzii: z.string().optional(),
  recomandari: z.string().optional(),
})

type FinalizeazaValues = z.infer<typeof finalizeazaSchema>

interface FinalizeazaFormProps {
  verificareId: string
  masuratoriCount: number
  masuratoriFailed: number
}


export function FinalizeazaForm({ verificareId, masuratoriCount, masuratoriFailed }: FinalizeazaFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [semnaturaTehnician, setSemnaturaTehnician] = useState<string | null>(null)
  const [semnaturaClient, setSemnaturaClient] = useState<string | null>(null)

  const suggestedRezultat = masuratoriFailed === 0 && masuratoriCount > 0 ? 'ADMIS' :
    masuratoriFailed > 0 && masuratoriFailed < masuratoriCount ? 'ADMIS_CU_REZERVE' :
    masuratoriFailed === masuratoriCount && masuratoriCount > 0 ? 'RESPINS' : 'ADMIS'

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FinalizeazaValues>({
    resolver: zodResolver(finalizeazaSchema),
    defaultValues: { rezultat: suggestedRezultat },
  })

  const onSubmit = async (data: FinalizeazaValues) => {
    const res = await fetch(`/api/verificari/${verificareId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'FINALIZATA',
        ...data,
        semnaturaTehnician,
        semnaturaClient,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Eroare', description: err.error, variant: 'destructive' })
      return
    }

    toast({ title: 'Verificare finalizată! Buletinul PRAM a fost generat automat.' })
    router.push(`/verificari/${verificareId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sumar măsurători */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-blue-800 mb-2">Sumar măsurători</p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-700 font-medium">{masuratoriCount - masuratoriFailed} conforme</span>
            </div>
            {masuratoriFailed > 0 && (
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 font-medium">{masuratoriFailed} neconforme</span>
              </div>
            )}
            <div className="text-gray-500">Total: {masuratoriCount}</div>
          </div>
          {masuratoriCount === 0 && (
            <div className="flex items-center gap-2 mt-2 text-amber-700 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Atenție: Nu există măsurători înregistrate!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rezultat — determinat automat din măsurători */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rezultat verificare</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="hidden" value={suggestedRezultat} {...register('rezultat')} />
          {suggestedRezultat === 'ADMIS' && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-green-300 bg-green-50 px-5 py-4">
              <CheckCircle2 className="h-7 w-7 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800 text-base">Admis</p>
                <p className="text-xs text-green-600 mt-0.5">Toate valorile în limite — determinat automat din măsurători</p>
              </div>
            </div>
          )}
          {suggestedRezultat === 'ADMIS_CU_REZERVE' && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
              <AlertTriangle className="h-7 w-7 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-800 text-base">Admis cu rezerve</p>
                <p className="text-xs text-amber-600 mt-0.5">Unele valori aproape de limită — determinat automat din măsurători</p>
              </div>
            </div>
          )}
          {suggestedRezultat === 'RESPINS' && (
            <div className="flex items-center gap-3 rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4">
              <XCircle className="h-7 w-7 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 text-base">Respins</p>
                <p className="text-xs text-red-600 mt-0.5">Valori depășite — determinat automat din măsurători</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Raport tehnic */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Raport tehnic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="observatiiTeren">Observații din teren</Label>
            <Textarea
              id="observatiiTeren"
              {...register('observatiiTeren')}
              placeholder="Descrieți starea instalației, condiții de lucru, anomalii observate..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="concluzii">Concluzii *</Label>
            <Textarea
              id="concluzii"
              {...register('concluzii')}
              placeholder="ex: Instalația electrică ADMISĂ. Priza de pământ corespunde normelor în vigoare."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recomandari">Recomandări</Label>
            <Textarea
              id="recomandari"
              {...register('recomandari')}
              placeholder="ex: Se recomandă verificarea circuitului 3 la următoarea revizuire..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Semnături */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Semnături</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SignatureCanvas
            label="Semnătură electrician / tehnician *"
            onChange={setSemnaturaTehnician}
          />
          <SignatureCanvas
            label="Semnătură beneficiar"
            onChange={setSemnaturaClient}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting} className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Finalizează și generează buletin
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Anulează
        </Button>
      </div>
    </form>
  )
}
