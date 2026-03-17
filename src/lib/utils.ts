import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistance, isAfter, isBefore, addDays } from 'date-fns'
import { ro } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return format(new Date(date), 'dd.MM.yyyy', { locale: ro })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: ro })
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: ro })
}

export function isExpiringSoon(date: Date | string | null | undefined, days: number = 30): boolean {
  if (!date) return false
  const targetDate = new Date(date)
  const warningDate = addDays(new Date(), days)
  return isAfter(targetDate, new Date()) && isBefore(targetDate, warningDate)
}

export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false
  return isBefore(new Date(date), new Date())
}

export function generateCode(prefix: string, number: number): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(number).padStart(4, '0')}`
}

export function formatCurrency(value: number | null | undefined, currency: string = 'RON'): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export const STATUS_VERIFICARE_LABELS: Record<string, string> = {
  PROGRAMATA: 'Programată',
  IN_DESFASURARE: 'În desfășurare',
  FINALIZATA: 'Finalizată',
  ANULATA: 'Anulată',
  AMANATA: 'Amânată',
}

export const REZULTAT_VERIFICARE_LABELS: Record<string, string> = {
  ADMIS: 'Admis',
  RESPINS: 'Respins',
  ADMIS_CU_REZERVE: 'Admis cu rezerve',
  IN_ASTEPTARE: 'În așteptare',
}

export const TIP_VERIFICARE_LABELS: Record<string, string> = {
  VERIFICARE_INITIALA: 'Verificare inițială',
  VERIFICARE_PERIODICA: 'Verificare periodică',
  VERIFICARE_DUPA_REPARATIE: 'Verificare după reparație',
  VERIFICARE_LA_CERERE: 'Verificare la cerere',
  RE_VERIFICARE: 'Re-verificare',
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  TEHNICIAN: 'Tehnician',
  BACK_OFFICE: 'Back-office',
  CLIENT: 'Client',
}

export const JUDET_OPTIONS = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud',
  'Botoșani', 'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași',
  'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița',
  'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș',
  'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu',
  'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui',
  'Vrancea',
]
