import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"

// PATCH /api/admin/users/:id - Update user permissions or active status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()

    // Get current user data for audit log
    const currentUser = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Handle active status
    if (typeof body.active === "boolean") {
      updates.push(`active = $${paramIndex}`)
      values.push(body.active)
      paramIndex++
    }

    // Handle permissions
    const permissionFields = [
      "can_view_client_demographics",
      "can_view_client_services",
      "can_view_all_clients",
      "can_export_client_data",
      "can_manage_users",
      "can_manage_system_settings",
      "can_view_audit_logs",
      "can_manage_database",
      "can_create_contacts",
      "can_edit_own_contacts",
      "can_edit_all_contacts",
      "can_delete_contacts",
    ]

    for (const field of permissionFields) {
      if (typeof body[field] === "boolean") {
        updates.push(`${field} = $${paramIndex}`)
        values.push(body[field])
        paramIndex++
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    // Execute update
    const query = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    values.push(userId)

    const result = await sql.unsafe(query, values)
    const updatedUser = result[0]

    await auditLog({
      action: "UPDATE",
      tableName: "users",
      recordId: userId.toString(),
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        before: currentUser[0],
        after: updatedUser,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { error: `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
