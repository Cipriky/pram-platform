'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ToggleStatusBtn({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isActiv = currentStatus === 'ACTIV'

  async function toggle() {
    if (!confirm(isActiv
      ? 'Dezactivezi accesul acestui utilizator? Nu va mai putea intra în platformă.'
      : 'Reactivezi accesul acestui utilizator?'
    )) return

    setLoading(true)
    await fetch(`/api/utilizatori/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: isActiv ? 'INACTIV' : 'ACTIV' }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant={isActiv ? 'destructive' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="w-full"
    >
      {isActiv ? (
        <><UserX className="h-4 w-4 mr-2" />Dezactivează cont</>
      ) : (
        <><UserCheck className="h-4 w-4 mr-2" />Activează cont</>
      )}
    </Button>
  )
}
