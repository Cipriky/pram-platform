'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

type Notificare = {
  id: string
  tip: string
  titlu: string
  mesaj: string
  citita: boolean
  url: string | null
  createdAt: string
}

const TIP_ICON: Record<string, string> = {
  VERIFICARE_PROGRAMATA: '📅',
  VERIFICARE_FINALIZATA: '✅',
  DOCUMENT_GENERAT: '📄',
  REMINDER: '🔔',
  SISTEM: 'ℹ️',
}

const TIP_COLOR: Record<string, string> = {
  VERIFICARE_PROGRAMATA: 'bg-blue-50 border-blue-200',
  VERIFICARE_FINALIZATA: 'bg-green-50 border-green-200',
  DOCUMENT_GENERAT: 'bg-purple-50 border-purple-200',
  REMINDER: 'bg-amber-50 border-amber-200',
  SISTEM: 'bg-gray-50 border-gray-200',
}

export default function NotificariPage() {
  const [notificari, setNotificari] = useState<Notificare[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = async () => {
    const res = await fetch('/api/notificari')
    const data = await res.json()
    setNotificari(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const markAllRead = async () => {
    await fetch('/api/notificari', { method: 'PUT' })
    setNotificari(prev => prev.map(n => ({ ...n, citita: true })))
    toast({ title: 'Toate notificările au fost marcate ca citite.' })
  }

  const toggleRead = async (id: string) => {
    await fetch(`/api/notificari/${id}`, { method: 'PUT' })
    setNotificari(prev => prev.map(n => n.id === id ? { ...n, citita: !n.citita } : n))
  }

  const necitite = notificari.filter(n => !n.citita).length

  if (loading) {
    return (
      <div>
        <Header title="Notificări" />
        <div className="p-6 flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
            <p>Se încarcă...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Notificări" />
      <div className="p-6 space-y-6 max-w-3xl">
        <PageHeader
          title="Notificări"
          description={necitite > 0 ? `${necitite} necitite` : 'Toate citite'}
        >
          {necitite > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Marchează toate citite
            </Button>
          )}
        </PageHeader>

        {notificari.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">Nicio notificare</p>
              <p className="text-sm text-gray-400 mt-1">Vei primi notificări la evenimentele importante.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notificari.map(n => (
              <div
                key={n.id}
                className={`rounded-xl border p-4 transition-all ${TIP_COLOR[n.tip] ?? 'bg-white border-gray-200'} ${!n.citita ? 'shadow-sm' : 'opacity-75'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{TIP_ICON[n.tip] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-semibold truncate ${!n.citita ? 'text-gray-900' : 'text-gray-600'}`}>
                        {n.titlu}
                      </p>
                      {!n.citita && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-snug">{n.mesaj}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {n.url && (
                      <Link href={n.url}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleRead(n.id)}
                      title={n.citita ? 'Marchează necitit' : 'Marchează citit'}
                    >
                      <Check className={`h-3.5 w-3.5 ${n.citita ? 'text-green-500' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
