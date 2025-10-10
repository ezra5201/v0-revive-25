"use client"

import { useAuth } from "./use-auth"
import { checkPermission } from "@/lib/permissions"

/**
 * Hook to check if the current user has a specific permission
 *
 * @param permission - The permission key to check (e.g., 'can_view_client_demographics')
 * @returns {Object} - { hasPermission: boolean, isLoading: boolean }
 *
 * @example
 * ```tsx
 * function ContactActions() {
 *   const { hasPermission: canDelete } = usePermission('can_delete_contacts')
 *
 *   return (
 *     <div>
 *       <Button onClick={handleEdit}>Edit</Button>
 *       {canDelete && <Button onClick={handleDelete}>Delete</Button>}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePermission(permission: string) {
  const { user, isLoading } = useAuth()

  return {
    hasPermission: checkPermission(user, permission),
    isLoading,
  }
}

/**
 * Hook to check multiple permissions at once
 *
 * @param permissions - Array of permission keys to check
 * @returns {Object} - { permissions: Record<string, boolean>, isLoading: boolean }
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { permissions, isLoading } = usePermissions([
 *     'can_manage_users',
 *     'can_manage_system_settings',
 *     'can_view_audit_logs'
 *   ])
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <div>
 *       {permissions.can_manage_users && <UserManagement />}
 *       {permissions.can_manage_system_settings && <SystemSettings />}
 *       {permissions.can_view_audit_logs && <AuditLogs />}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePermissions(permissionList: string[]) {
  const { user, isLoading } = useAuth()

  const permissions = permissionList.reduce(
    (acc, permission) => {
      acc[permission] = checkPermission(user, permission)
      return acc
    },
    {} as Record<string, boolean>,
  )

  return {
    permissions,
    isLoading,
  }
}
