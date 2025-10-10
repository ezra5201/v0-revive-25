import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { getDefaultPermissions } from "@/lib/user-roles"

// GET /api/admin/users - Get all users
export async function GET(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const users = await sql`
      SELECT 
        id, email, active,
        can_view_client_demographics, can_view_client_services, 
        can_view_all_clients, can_export_client_data,
        can_manage_users, can_manage_system_settings, 
        can_view_audit_logs, can_manage_database,
        can_create_contacts, can_edit_own_contacts, 
        can_edit_all_contacts, can_delete_contacts,
        created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `

    await auditLog({
      action: "VIEW",
      tableName: "users",
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json(
      { error: `Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { email, ...permissions } = body

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Ensure at least one permission is enabled
    const defaultPerms = getDefaultPermissions()
    const hasPermission = Object.keys(defaultPerms).some((key) => permissions[key] === true)

    if (!hasPermission) {
      return NextResponse.json({ error: "At least one permission must be enabled" }, { status: 400 })
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create user with permissions
    const result = await sql`
      INSERT INTO users (
        email,
        can_view_client_demographics, can_view_client_services,
        can_view_all_clients, can_export_client_data,
        can_manage_users, can_manage_system_settings,
        can_view_audit_logs, can_manage_database,
        can_create_contacts, can_edit_own_contacts,
        can_edit_all_contacts, can_delete_contacts
      ) VALUES (
        ${email},
        ${permissions.can_view_client_demographics || false},
        ${permissions.can_view_client_services || false},
        ${permissions.can_view_all_clients || false},
        ${permissions.can_export_client_data || false},
        ${permissions.can_manage_users || false},
        ${permissions.can_manage_system_settings || false},
        ${permissions.can_view_audit_logs || false},
        ${permissions.can_manage_database || false},
        ${permissions.can_create_contacts || false},
        ${permissions.can_edit_own_contacts || false},
        ${permissions.can_edit_all_contacts || false},
        ${permissions.can_delete_contacts || false}
      )
      RETURNING *
    `

    const newUser = result[0]

    await auditLog({
      action: "CREATE",
      tableName: "users",
      recordId: newUser.id.toString(),
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        email,
        permissions,
      },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json(
      { error: `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
