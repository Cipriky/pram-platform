import { UserRole } from '@prisma/client'

// Ierarhie roluri
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 5,
  MANAGER: 4,
  BACK_OFFICE: 3,
  TEHNICIAN: 2,
  CLIENT: 1,
}

// Permisiuni granulare
export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'clients:read'
  | 'clients:write'
  | 'clients:delete'
  | 'locations:read'
  | 'locations:write'
  | 'locations:delete'
  | 'verifications:read'
  | 'verifications:write'
  | 'verifications:delete'
  | 'verifications:assign'
  | 'measurements:read'
  | 'measurements:write'
  | 'devices:read'
  | 'devices:write'
  | 'devices:delete'
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'reports:read'
  | 'settings:read'
  | 'settings:write'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'users:read', 'users:write', 'users:delete',
    'clients:read', 'clients:write', 'clients:delete',
    'locations:read', 'locations:write', 'locations:delete',
    'verifications:read', 'verifications:write', 'verifications:delete', 'verifications:assign',
    'measurements:read', 'measurements:write',
    'devices:read', 'devices:write', 'devices:delete',
    'documents:read', 'documents:write', 'documents:delete',
    'reports:read',
    'settings:read', 'settings:write',
  ],
  MANAGER: [
    'users:read',
    'clients:read', 'clients:write',
    'locations:read', 'locations:write',
    'verifications:read', 'verifications:write', 'verifications:assign',
    'measurements:read', 'measurements:write',
    'devices:read', 'devices:write',
    'documents:read', 'documents:write',
    'reports:read',
    'settings:read',
  ],
  BACK_OFFICE: [
    'clients:read', 'clients:write',
    'locations:read', 'locations:write',
    'verifications:read', 'verifications:write',
    'measurements:read',
    'devices:read',
    'documents:read', 'documents:write',
    'reports:read',
  ],
  TEHNICIAN: [
    'clients:read',
    'locations:read',
    'verifications:read', 'verifications:write',
    'measurements:read', 'measurements:write',
    'devices:read',
    'documents:read',
  ],
  CLIENT: [
    'locations:read',
    'verifications:read',
    'documents:read',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function isRoleAtLeast(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

// Navigation items by role
export const NAV_ITEMS_BY_ROLE: Record<UserRole, string[]> = {
  ADMIN: ['dashboard', 'clienti', 'locatii', 'verificari', 'tehnicieni', 'aparate', 'documente', 'rapoarte', 'setari'],
  MANAGER: ['dashboard', 'clienti', 'locatii', 'verificari', 'tehnicieni', 'aparate', 'documente', 'rapoarte'],
  BACK_OFFICE: ['dashboard', 'clienti', 'locatii', 'verificari', 'aparate', 'documente'],
  TEHNICIAN: ['dashboard', 'verificari-mele', 'verificari', 'locatii'],
  CLIENT: ['dashboard', 'locatiile-mele', 'verificarile-mele', 'documente-mele'],
}
