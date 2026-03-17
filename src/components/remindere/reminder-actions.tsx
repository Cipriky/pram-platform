'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, BellOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ReminderActionsProps {
  reminderId: string
  status: string
}

export function ReminderActions({ reminderId, status }: ReminderActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const deactivate = async () => {
    setLoading(true)
    const res = await fetch(`/api/remindere/${reminderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DEZACTIVAT' }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: 'Reminder dezactivat' })
      router.refresh()
    }
    setOpen(false)
  }

  if (status === 'DEZACTIVAT') return null

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(!open)}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 rounded-lg border bg-white shadow-lg z-20 py-1">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={deactivate}
              disabled={loading}
            >
              <BellOff className="h-4 w-4 text-gray-400" />
              Dezactivează
            </button>
          </div>
        </>
      )}
    </div>
  )
}
