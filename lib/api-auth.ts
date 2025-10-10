import type { User } from "@/lib/user-roles"
import { requirePermission } from "@/lib/permissions"
import { auditLog, getIpAddressFromRequest } from "@/lib/audit-log"

/**
 * Get the current authenticated user from the request
 *
 * TODO: Replace with Stack Auth implementation
 * Currently returns a mock user for development purposes
 *
 * @param request - The incoming request object
 * @returns The authenticated user or null if not authenticated
 *
 * @example
 * const user = await getCurrentUser(request)
 * if (!user) {
 *   return unauthorizedResponse()
 * }
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  // Check for Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    // TODO: Implement actual token validation with Stack Auth
    // For now, return a mock user for development
    const token = authHeader.replace("Bearer ", "")
    if (token === "dev-token") {
      return {
        id: 1,
        email: "dev@example.com",
        active: true,
        created_at: new Date().toISOString(),
        // Mock permissions - Super Admin for development
        can_view_client_demographics: true,
        can_view_client_services: true,
        can_view_all_clients: true,
        can_export_client_data: true,
        can_manage_users: true,
        can_manage_system_settings: true,
        can_view_audit_logs: true,
        can_manage_database: true,
        can_create_contacts: true,
        can_edit_own_contacts: true,
        can_edit_all_contacts: true,
        can_delete_contacts: true,
      }
    }
  }

  // Check for session cookie
  const cookies = request.headers.get("cookie")
  if (cookies?.includes("session=")) {
    // TODO: Implement actual session validation with Stack Auth
    // For now, return a mock user for development
    return {
      id: 1,
      email: "dev@example.com",
      active: true,
      created_at: new Date().toISOString(),
      // Mock permissions - Super Admin for development
      can_view_client_demographics: true,
      can_view_client_services: true,
      can_view_all_clients: true,
      can_export_client_data: true,
      can_manage_users: true,
      can_manage_system_settings: true,
      can_view_audit_logs: true,
      can_manage_database: true,
      can_create_contacts: true,
      can_edit_own_contacts: true,
      can_edit_all_contacts: true,
      can_delete_contacts: true,
    }
  }

  // No authentication found
  return null
}

/**
 * Create a 401 Unauthorized response
 *
 * @returns Response with 401 status and error message
 */
export function unauthorizedResponse(): Response {
  return Response.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 })
}

/**
 * Create a 403 Forbidden response
 *
 * @param permission - The permission that was required
 * @returns Response with 403 status and error message
 */
export function forbiddenResponse(permission: string): Response {
  const readablePermission = permission.replace("can_", "").replace(/_/g, " ")
  return Response.json(
    {
      error: `Permission denied: ${readablePermission} required`,
      code: "FORBIDDEN",
      permission,
    },
    { status: 403 },
  )
}

/**
 * Higher-order function to protect API routes with authentication
 *
 * Wraps an API route handler to ensure the user is authenticated.
 * Returns 401 if not authenticated, otherwise passes the user to the handler.
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler that checks authentication
 *
 * @example
 * // app/api/clients/route.ts
 * export const GET = withAuth(async (request, user) => {
 *   // user is guaranteed to exist here
 *   const clients = await sql`SELECT * FROM clients`
 *   return Response.json({ clients })
 * })
 */
export function withAuth<T extends any[]>(
  handler: (request: Request, user: User, ...args: T) => Promise<Response>,
): (request: Request, ...args: T) => Promise<Response> {
  return async (request: Request, ...args: T) => {
    const user = await getCurrentUser(request)

    if (!user) {
      return unauthorizedResponse()
    }

    if (!user.active) {
      return Response.json({ error: "User account is inactive", code: "INACTIVE_ACCOUNT" }, { status: 403 })
    }

    return handler(request, user, ...args)
  }
}

/**
 * Higher-order function to protect API routes with authentication and permission checks
 *
 * Wraps an API route handler to ensure the user is authenticated and has the required permission.
 * Returns 401 if not authenticated, 403 if permission denied.
 * Logs failed permission checks to the audit log.
 *
 * @param permission - The permission key required (e.g., 'can_view_client_demographics')
 * @returns Function that wraps the handler with auth and permission checks
 *
 * @example
 * // app/api/contacts/route.ts
 * export const POST = withPermission('can_create_contacts')(
 *   async (request, user) => {
 *     // user exists and has can_create_contacts permission
 *     const data = await request.json()
 *     const result = await sql`INSERT INTO contacts (...) VALUES (...)`
 *     return Response.json({ contact: result[0] })
 *   }
 * )
 */
export function withPermission(
  permission: string,
): <T extends any[]>(
  handler: (request: Request, user: User, ...args: T) => Promise<Response>,
) => (request: Request, ...args: T) => Promise<Response> {
  return <T extends any[]>(handler: (request: Request, user: User, ...args: T) => Promise<Response>) => {
    return async (request: Request, ...args: T) => {
      const user = await getCurrentUser(request)

      if (!user) {
        return unauthorizedResponse()
      }

      if (!user.active) {
        return Response.json({ error: "User account is inactive", code: "INACTIVE_ACCOUNT" }, { status: 403 })
      }

      // Check permission
      try {
        requirePermission(user, permission)
      } catch (error) {
        // Log failed permission check to audit log
        const ipAddress = getIpAddressFromRequest(request)
        await auditLog({
          action: "VIEW",
          tableName: "permission_denied",
          userEmail: user.email,
          ipAddress,
          changes: {
            permission,
            reason: error instanceof Error ? error.message : "Permission denied",
          },
        })

        return forbiddenResponse(permission)
      }

      return handler(request, user, ...args)
    }
  }
}
