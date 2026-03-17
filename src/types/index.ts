import { UserRole, StatusVerificare, RezultatVerificare, TipVerificare } from '@prisma/client'

export type { UserRole }

export interface DashboardStats {
  totalClienti: number
  totalLocatii: number
  verificariLuna: number
  verificariProgramate: number
  verificariInDesfasurare: number
  aparateNecesitaEtalonare: number
  remindereActive: number
}

export interface VerificareWithRelations {
  id: string
  numar: string
  tip: TipVerificare
  status: StatusVerificare
  rezultat: RezultatVerificare | null
  dataProgramata: Date
  dataFinalizare: Date | null
  locatie: {
    id: string
    denumire: string
    oras: string
    judet: string
    client: {
      id: string
      denumire: string
      cod: string
    }
  }
  tehnician: {
    id: string
    nume: string
    prenume: string
    email: string
  } | null
}

export interface ClientWithStats {
  id: string
  cod: string
  denumire: string
  tip: string
  oras: string | null
  judet: string | null
  status: string
  _count: {
    locatii: number
  }
}

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export type SortDirection = 'asc' | 'desc'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
