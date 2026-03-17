'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  MapPin,
  ClipboardCheck,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Zap,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@prisma/client'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER', 'TEHNICIAN', 'BACK_OFFICE'],
  },
  {
    title: 'Clienți',
    href: '/clienti',
    icon: Building2,
    roles: ['ADMIN', 'MANAGER', 'BACK_OFFICE'],
  },
  {
    title: 'Locații',
    href: '/locatii',
    icon: MapPin,
    roles: ['ADMIN', 'MANAGER', 'BACK_OFFICE', 'TEHNICIAN'],
  },
  {
    title: 'Verificări PRAM',
    href: '/verificari',
    icon: ClipboardCheck,
    roles: ['ADMIN', 'MANAGER', 'BACK_OFFICE', 'TEHNICIAN'],
  },
  {
    title: 'Tehnicieni',
    href: '/tehnicieni',
    icon: Users,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Aparate Măsură',
    href: '/aparate',
    icon: Wrench,
    roles: ['ADMIN', 'MANAGER', 'BACK_OFFICE', 'TEHNICIAN'],
  },
  {
    title: 'Documente',
    href: '/documente',
    icon: FileText,
    roles: ['ADMIN', 'MANAGER', 'BACK_OFFICE'],
  },
  {
    title: 'Rapoarte',
    href: '/rapoarte',
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Setări',
    href: '/setari',
    icon: Settings,
    roles: ['ADMIN'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole | undefined

  const filteredItems = navItems.filter(
    item => userRole && item.roles.includes(userRole)
  )

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight">PRAM</span>
          <p className="text-[10px] text-gray-400 -mt-0.5">Platform Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300')} />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold">
            {session?.user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {session?.user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
