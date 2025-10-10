import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { UpdateUserSchema, validateRequest } from "@/lib/validations"

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

    const validation = validateRequest(UpdateUserSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    // Get current user data for audit log
    const currentUser = await sql`SELECT * FROM users WHERE id = ${userId}`
    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Handle all fields from validated data
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
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
