"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { checkPermission } from "@/lib/permissions"

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component to conditionally render UI elements based on user permissions
 *
 * Does not show a loading state - simply hides content if permission is not granted.
 * Returns fallback element if provided, otherwise returns null (hides completely).
 *
 * @example
 * ```tsx
 * // Hide a button
 * import { PermissionGate } from '@/components/permission-gate'
 *
 * export function ExportButton() {
 *   return (
 *     <PermissionGate permission="can_export_client_data">
 *       <Button onClick={handleExport}>Export Data</Button>
 *     </PermissionGate>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With fallback content
 * <PermissionGate
 *   permission="can_delete_contacts"
 *   fallback={<Button disabled>Delete (No Permission)</Button>}
 * >
 *   <Button onClick={handleDelete} variant="destructive">Delete</Button>
 * </PermissionGate>
 * ```
 *
 * @example
 * ```tsx
 * // Hide entire sections
 * <PermissionGate permission="can_view_audit_logs">
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Audit Logs</CardTitle>
 *     </CardHeader>
 *     <CardContent>
 *       <AuditLogTable />
 *     </CardContent>
 *   </Card>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { user } = useAuth()

  // Check if user has the required permission
  const hasPermission = checkPermission(user, permission)

  // Return fallback or null if no permission
  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null
  }

  // User has permission, render children
  return <>{children}</>
}
