import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

// Rute publice (nu necesită autentificare)
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

// Rute restricționate pe rol
const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/setari': ['ADMIN'],
  '/utilizatori': ['ADMIN', 'MANAGER'],
  '/tehnicieni': ['ADMIN', 'MANAGER'],
  '/clienti': ['ADMIN', 'MANAGER', 'BACK_OFFICE'],
  '/documente': ['ADMIN', 'MANAGER', 'BACK_OFFICE'],
  '/rapoarte': ['ADMIN', 'MANAGER', 'BACK_OFFICE'],
  '/aparate': ['ADMIN', 'MANAGER', 'BACK_OFFICE', 'TEHNICIAN'],
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Verifică dacă ruta are restricții de rol
    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route)) {
        if (!token?.role || !allowedRoles.includes(token.role as UserRole)) {
          return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url))
        }
      }
    }

    // Clienții sunt redirecționați la portal
    if (token?.role === 'CLIENT' && !pathname.startsWith('/portal')) {
      return NextResponse.redirect(new URL('/portal', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Permite rutele publice
        if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
          return true
        }

        // Permite rutele API de autentificare
        if (pathname.startsWith('/api/auth')) {
          return true
        }

        // Restul rutelor necesită token valid
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
