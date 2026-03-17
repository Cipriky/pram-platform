'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { UserRole, StatusVerificare } from '@prisma/client'
import { Play, CheckCircle, XCircle, Clock, Loader2, CalendarClock } from 'lucide-react'

interface VerificareActiuniProps {
  verificareId: string
  status: StatusVerificare
  userRole: UserRole
  tehnicianId?: string
  userId: string
}

export function VerificareActiuni({ verificareId, status, userRole, tehnicianId, userId }: VerificareActiuniProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [showAmanareForm, setShowAmanareForm] = useState(false)
  const [novaData, setNovaData] = useState('')

  const isTehnician = userRole === 'TEHNICIAN'
  const isMeuTehnician = isTehnician && tehnicianId === userId
  const canManage = ['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(userRole)

  const updateStatus = async (newStatus: string, extraData?: Record<string, any>) => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/verificari/${verificareId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast({ title: 'Eroare', description: err.error, variant: 'destructive' })
        return
      }

      toast({ title: 'Status actualizat cu succes!' })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const confirmaAmanare = () => {
    if (!novaData) return
    updateStatus('AMANATA', { dataProgramata: novaData })
    setShowAmanareForm(false)
    setNovaData('')
  }

  if (status === 'FINALIZATA' || status === 'ANULATA') {
    return null
  }

  const minData = new Date().toISOString().slice(0, 16)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tehnician poate porni verificarea */}
      {status === 'PROGRAMATA' && (isMeuTehnician || canManage) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus('IN_DESFASURARE')}
          disabled={loading !== null}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          {loading === 'IN_DESFASURARE' ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1.5" />
          )}
          Pornește
        </Button>
      )}

      {/* Finalizare */}
      {status === 'IN_DESFASURARE' && (isMeuTehnician || canManage) && (
        <Button
          size="sm"
          onClick={() => router.push(`/verificari/${verificareId}/finalizeaza`)}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Finalizează
        </Button>
      )}

      {/* Amânare și anulare - doar manager/admin */}
      {canManage && (
        <>
          {status === 'PROGRAMATA' && (
            <>
              {showAmanareForm ? (
                <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 shadow-sm">
                  <CalendarClock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <input
                    type="datetime-local"
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    min={minData}
                    className="h-7 text-xs border border-orange-200 rounded px-2 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <Button
                    size="sm"
                    onClick={confirmaAmanare}
                    disabled={!novaData || loading !== null}
                    className="h-7 text-xs bg-orange-500 hover:bg-orange-600 px-3"
                  >
                    {loading === 'AMANATA' ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
                  </Button>
                  <button
                    onClick={() => { setShowAmanareForm(false); setNovaData('') }}
                    className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAmanareForm(true)}
                  disabled={loading !== null}
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  Amână
                </Button>
              )}
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus('ANULATA')}
            disabled={loading !== null}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            {loading === 'ANULATA' ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-1.5" />
            )}
            Anulează
          </Button>
        </>
      )}
    </div>
  )
}
