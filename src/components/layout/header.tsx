'use client'

import { signOut, useSession } from 'next-auth/react'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/utils'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    fetch('/api/notificari/count')
      .then(r => r.json())
      .then(d => setNotifCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur px-6">
      <div className="flex-1">
        {title && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notificări */}
        <Link href="/notificari">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {notifCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {notifCount > 9 ? '9+' : notifCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
              {session?.user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-medium text-gray-900 leading-none">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {session?.user?.role ? ROLE_LABELS[session.user.role] : ''}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-52 rounded-lg border bg-white shadow-lg z-20 py-1">
                <Link
                  href="/profil"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profilul meu
                </Link>
                <div className="my-1 border-t" />
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Deconectare
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
