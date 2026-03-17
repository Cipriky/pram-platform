import { Badge } from '@/components/ui/badge'
import { StatusVerificare, RezultatVerificare } from '@prisma/client'

interface StatusVerificareProps {
  status: StatusVerificare
}

export function StatusVerificareBadge({ status }: StatusVerificareProps) {
  const config: Record<StatusVerificare, { label: string; variant: any }> = {
    PROGRAMATA: { label: 'Programată', variant: 'info' },
    IN_DESFASURARE: { label: 'În desfășurare', variant: 'warning' },
    FINALIZATA: { label: 'Finalizată', variant: 'success' },
    ANULATA: { label: 'Anulată', variant: 'destructive' },
    AMANATA: { label: 'Amânată', variant: 'secondary' },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

interface RezultatVerificareProps {
  rezultat: RezultatVerificare | null
}

export function RezultatVerificareBadge({ rezultat }: RezultatVerificareProps) {
  if (!rezultat) return null
  const config: Record<RezultatVerificare, { label: string; variant: any }> = {
    ADMIS: { label: 'Admis', variant: 'success' },
    RESPINS: { label: 'Respins', variant: 'destructive' },
    ADMIS_CU_REZERVE: { label: 'Admis cu rezerve', variant: 'warning' },
    IN_ASTEPTARE: { label: 'În așteptare', variant: 'secondary' },
  }
  const { label, variant } = config[rezultat]
  return <Badge variant={variant}>{label}</Badge>
}

interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config: Record<string, { label: string; variant: any }> = {
    ADMIN: { label: 'Administrator', variant: 'destructive' },
    MANAGER: { label: 'Manager', variant: 'purple' },
    TEHNICIAN: { label: 'Tehnician', variant: 'info' },
    BACK_OFFICE: { label: 'Back-office', variant: 'secondary' },
    CLIENT: { label: 'Client', variant: 'outline' },
  }
  const cfg = config[role] ?? { label: role, variant: 'outline' }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

interface StatusClientProps {
  status: string
}

export function StatusClientBadge({ status }: StatusClientProps) {
  const config: Record<string, { label: string; variant: any }> = {
    ACTIV: { label: 'Activ', variant: 'success' },
    INACTIV: { label: 'Inactiv', variant: 'secondary' },
    PROSPECT: { label: 'Prospect', variant: 'info' },
  }
  const cfg = config[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

interface StatusAparatProps {
  status: string
}

export function StatusAparatBadge({ status }: StatusAparatProps) {
  const config: Record<string, { label: string; variant: any }> = {
    ACTIV: { label: 'Activ', variant: 'success' },
    IN_SERVICE: { label: 'Service', variant: 'warning' },
    DEFECT: { label: 'Defect', variant: 'destructive' },
    CASSAT: { label: 'Casat', variant: 'secondary' },
  }
  const cfg = config[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
