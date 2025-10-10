/**
 * Permission utility functions for HIPAA-compliant user access control
 *
 * @example
 * // In an API route:
 * import { requirePermission, canViewClientData } from '@/lib/permissions'
 *
 * export async function GET(request: Request) {
 *   const user = await getCurrentUser()
 *   requirePermission(user, 'can_view_client_demographics')
 *   // ... rest of route logic
 * }
 */

/**
 * User interface with permission fields
 */
export interface User {
  id: number
  email: string
  active: boolean
  can_view_client_demographics?: boolean
  can_view_client_services?: boolean
  can_view_all_clients?: boolean
  can_export_client_data?: boolean
  can_manage_users?: boolean
  can_manage_system_settings?: boolean
  can_view_audit_logs?: boolean
  can_manage_database?: boolean
  can_create_contacts?: boolean
  can_edit_own_contacts?: boolean
  can_edit_all_contacts?: boolean
  can_delete_contacts?: boolean
  [key: string]: any
}

/**
 * Permission constants grouped by category
 */
export const PERMISSION_CONSTANTS = {
  DATA_ACCESS: [
    "can_view_client_demographics",
    "can_view_client_services",
    "can_view_all_clients",
    "can_export_client_data",
    "can_view_audit_logs",
  ] as const,

  SYSTEM_MANAGEMENT: ["can_manage_users", "can_manage_system_settings", "can_manage_database"] as const,

  OPERATIONS: ["can_create_contacts", "can_edit_own_contacts", "can_edit_all_contacts", "can_delete_contacts"] as const,
} as const

/**
 * Check if a user has a specific permission
 *
 * @param user - The user object to check permissions for
 * @param permission - The permission key to check (e.g., 'can_view_client_demographics')
 * @returns true if user has the permission, false otherwise
 *
 * @example
 * if (checkPermission(user, 'can_view_client_demographics')) {
 *   // User can view client demographics
 * }
 */
export function checkPermission(user: User | null, permission: string): boolean {
  if (!user) return false
  if (!user.active) return false
  return user[permission] === true
}

/**
 * Require a user to have a specific permission, throwing an error if they don't
 *
 * @param user - The user object to check permissions for
 * @param permission - The permission key to require
 * @throws Error if user lacks the permission
 *
 * @example
 * // In an API route:
 * export async function POST(request: Request) {
 *   const user = await getCurrentUser()
 *   requirePermission(user, 'can_create_contacts')
 *   // ... rest of route logic
 * }
 */
export function requirePermission(user: User | null, permission: string): void {
  if (!user) {
    throw new Error("Authentication required")
  }
  if (!user.active) {
    throw new Error("User account is inactive")
  }
  if (!user[permission]) {
    throw new Error(`Permission denied: ${permission.replace("can_", "").replace(/_/g, " ")} required`)
  }
}

/**
 * Check if user can view any client data (demographics or services)
 *
 * @param user - The user object to check permissions for
 * @returns true if user can view demographics OR services
 *
 * @example
 * if (canViewClientData(user)) {
 *   // Show client data sections
 * }
 */
export function canViewClientData(user: User | null): boolean {
  return checkPermission(user, "can_view_client_demographics") || checkPermission(user, "can_view_client_services")
}

/**
 * Check if user has any system management permissions
 *
 * @param user - The user object to check permissions for
 * @returns true if user has any system management permission
 *
 * @example
 * if (canManageSystem(user)) {
 *   // Show admin menu
 * }
 */
export function canManageSystem(user: User | null): boolean {
  return hasAnyPermission(user, [...PERMISSION_CONSTANTS.SYSTEM_MANAGEMENT])
}

/**
 * Check if user can edit a specific contact
 *
 * @param user - The user object to check permissions for
 * @param contactOwnerId - The ID of the user who owns the contact
 * @returns true if user can edit this contact
 *
 * @example
 * if (canEditContact(user, contact.created_by)) {
 *   // Show edit button
 * }
 */
export function canEditContact(user: User | null, contactOwnerId: number): boolean {
  if (!user) return false

  // Can edit all contacts
  if (checkPermission(user, "can_edit_all_contacts")) {
    return true
  }

  // Can edit own contacts if they own this one
  if (user.id === contactOwnerId && checkPermission(user, "can_edit_own_contacts")) {
    return true
  }

  return false
}

/**
 * Check if user can delete data (contacts)
 *
 * @param user - The user object to check permissions for
 * @returns true if user can delete contacts
 *
 * @example
 * if (canDeleteData(user)) {
 *   // Show delete button
 * }
 */
export function canDeleteData(user: User | null): boolean {
  return checkPermission(user, "can_delete_contacts")
}

/**
 * Check if user has ANY of the specified permissions
 *
 * @param user - The user object to check permissions for
 * @param permissions - Array of permission keys to check
 * @returns true if user has at least one of the permissions
 *
 * @example
 * if (hasAnyPermission(user, ['can_view_client_demographics', 'can_view_client_services'])) {
 *   // User can view some client data
 * }
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.active) return false
  return permissions.some((permission) => user[permission] === true)
}

/**
 * Check if user has ALL of the specified permissions
 *
 * @param user - The user object to check permissions for
 * @param permissions - Array of permission keys to check
 * @returns true if user has all of the permissions
 *
 * @example
 * if (hasAllPermissions(user, ['can_view_client_demographics', 'can_export_client_data'])) {
 *   // User can view and export client data
 * }
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.active) return false
  return permissions.every((permission) => user[permission] === true)
}
