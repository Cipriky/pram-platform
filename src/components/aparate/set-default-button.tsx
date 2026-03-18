'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function SetDefaultButton({ aparatId, isDefault }: { aparatId: string; isDefault: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (isDefault) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        Aparat implicit pentru buletine
      </div>
    )
  }

  const handleClick = async () => {
    setLoading(true)
    await fetch(`/api/aparate/${aparatId}/set-default`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      <Star className="h-4 w-4 mr-2" />
      {loading ? 'Se setează...' : 'Setează ca implicit'}
    </Button>
  )
}
