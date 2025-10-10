"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { checkPermission } from "@/lib/permissions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

interface ProtectedRouteProps {
  requiredPermission: string
  children: React.ReactNode
  fallbackMessage?: string
}

/**
 * Component to protect entire pages based on user permissions
 *
 * Shows a loading spinner while authentication is loading.
 * Shows an access denied alert if the user lacks the required permission.
 * Renders children if the user has the required permission.
 *
 * @example
 * ```tsx
 * // app/admin/users/page.tsx
 * import { ProtectedRoute } from '@/components/protected-route'
 *
 * export default function UsersPage() {
 *   return (
 *     <ProtectedRoute requiredPermission="can_manage_users">
 *       <div>User management content...</div>
 *     </ProtectedRoute>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom fallback message
 * <ProtectedRoute
 *   requiredPermission="can_export_client_data"
 *   fallbackMessage="You need data export permissions to access this page."
 * >
 *   <ExportDataPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({ requiredPermission, children, fallbackMessage }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    )
  }

  // Check if user has the required permission
  const hasPermission = checkPermission(user, requiredPermission)

  // Show access denied alert if user lacks permission
  if (!hasPermission) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            <p>{fallbackMessage || "You don't have permission to view this page."}</p>
            <p className="mt-2 text-sm">Contact your administrator if you believe you should have access.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // User has permission, render children
  return <>{children}</>
}
