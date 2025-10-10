import { sql } from "@/lib/db"

export type AuditAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE"

export interface AuditLogParams {
  action: AuditAction
  tableName: string
  recordId?: string | number
  clientName?: string
  changes?: Record<string, any>
  userEmail?: string
  ipAddress?: string
}

/**
 * HIPAA-compliant audit logging function
 * Records all data access and modifications for compliance purposes
 *
 * @param params - Audit log parameters
 * @returns Promise<void>
 *
 * @example
 * // Log a view action
 * await auditLog({
 *   action: 'VIEW',
 *   tableName: 'contacts',
 *   recordId: '123',
 *   clientName: 'John Doe',
 *   userEmail: 'provider@example.com',
 *   ipAddress: '192.168.1.1'
 * })
 *
 * @example
 * // Log an update action with changes
 * await auditLog({
 *   action: 'UPDATE',
 *   tableName: 'contacts',
 *   recordId: '123',
 *   clientName: 'John Doe',
 *   changes: {
 *     before: { services_provided: 'Food' },
 *     after: { services_provided: 'Food, Clothing' }
 *   },
 *   userEmail: 'provider@example.com',
 *   ipAddress: '192.168.1.1'
 * })
 */
export async function auditLog(params: AuditLogParams): Promise<void> {
  const {
    action,
    tableName,
    recordId = null,
    clientName = null,
    changes = null,
    userEmail = "system",
    ipAddress = null,
  } = params

  try {
    await sql`
      INSERT INTO audit_logs (
        user_email,
        action,
        table_name,
        record_id,
        client_name,
        ip_address,
        changes
      ) VALUES (
        ${userEmail},
        ${action},
        ${tableName},
        ${recordId?.toString() || null},
        ${clientName},
        ${ipAddress},
        ${changes ? JSON.stringify(changes) : null}
      )
    `
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main operation
    console.error("[Audit Log Error]", error)
  }
}

/**
 * Helper function to extract user email from request headers
 * Supports common authentication patterns
 */
export function getUserEmailFromRequest(request: Request): string {
  // Try to get from authorization header (JWT, Bearer token, etc.)
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    // This is a placeholder - implement based on your auth system
    // For example, decode JWT token to get user email
    // const token = authHeader.replace('Bearer ', '')
    // const decoded = decodeJWT(token)
    // return decoded.email
  }

  // Try to get from custom header
  const userEmailHeader = request.headers.get("x-user-email")
  if (userEmailHeader) {
    return userEmailHeader
  }

  // Default to system if no user found
  return "system"
}

/**
 * Helper function to extract IP address from request
 * Handles various proxy and forwarding scenarios
 */
export function getIpAddressFromRequest(request: Request): string | null {
  // Check for forwarded IP (common in production behind proxies)
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim()
  }

  // Check for real IP header (used by some proxies)
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Check for Cloudflare connecting IP
  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return null
}

/**
 * Convenience function to create audit log from API route
 * Automatically extracts user and IP from request
 *
 * @example
 * export async function GET(request: Request) {
 *   await auditLogFromRequest(request, {
 *     action: 'VIEW',
 *     tableName: 'contacts',
 *     recordId: '123',
 *     clientName: 'John Doe'
 *   })
 *   // ... rest of your API logic
 * }
 */
export async function auditLogFromRequest(
  request: Request,
  params: Omit<AuditLogParams, "userEmail" | "ipAddress">,
): Promise<void> {
  const userEmail = getUserEmailFromRequest(request)
  const ipAddress = getIpAddressFromRequest(request)

  await auditLog({
    ...params,
    userEmail,
    ipAddress,
  })
}

export const getUserFromRequest = getUserEmailFromRequest
export const getIpFromRequest = getIpAddressFromRequest
