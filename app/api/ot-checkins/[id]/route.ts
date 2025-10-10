import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { UpdateCheckinSchema, validateRequest } from "@/lib/validations"

interface UpdateOTCheckinRequest {
  notes?: string
  status?: "Draft" | "Completed"
}

const VALID_STATUSES = ["Draft", "Completed", "Cancelled"] as const
const VALID_STATUS_TRANSITIONS = {
  Draft: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
} as const

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const checkinId = Number.parseInt(params.id)
    if (isNaN(checkinId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid check-in ID",
            details: { field: "id", value: params.id },
          },
        },
        { status: 400 },
      )
    }

    const result = await sql`
      SELECT id, contact_id, client_name, client_uuid, provider_name, notes, status, created_at, updated_at
      FROM ot_checkins 
      WHERE id = ${checkinId}
    `

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "OT check-in not found",
            details: { id: checkinId },
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Failed to fetch OT check-in:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch OT check-in",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const checkinId = Number.parseInt(params.id)
    if (isNaN(checkinId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid check-in ID",
            details: { field: "id", value: params.id },
          },
        },
        { status: 400 },
      )
    }

    const body = await request.json()

    const validation = validateRequest(UpdateCheckinSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    const currentCheckin = await sql`
      SELECT id, status, notes, client_name FROM ot_checkins WHERE id = ${checkinId}
    `

    if (currentCheckin.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "OT check-in not found",
            details: { id: checkinId },
          },
        },
        { status: 404 },
      )
    }

    const currentStatus = currentCheckin[0].status
    const previousNotes = currentCheckin[0].notes
    const clientName = currentCheckin[0].client_name

    // Build update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (validatedData.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`)
      updateValues.push(validatedData.notes)
      paramIndex++
    }

    if (validatedData.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      updateValues.push(validatedData.status)
      paramIndex++
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updateFields.length === 1) {
      // Only updated_at
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No valid fields provided for update",
            details: { providedFields: Object.keys(body) },
          },
        },
        { status: 400 },
      )
    }

    // Add the checkin ID as the last parameter
    updateValues.push(checkinId)

    const updateQuery = `
      UPDATE ot_checkins 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, contact_id, client_name, client_uuid, provider_name, notes, status, created_at, updated_at
    `

    const result = await sql.query(updateQuery, updateValues)
    const updatedCheckin = result[0]

    const auditChanges: any = { before: {}, after: {} }
    if (validatedData.notes !== undefined && validatedData.notes !== previousNotes) {
      auditChanges.before.notes = previousNotes
      auditChanges.after.notes = validatedData.notes
    }
    if (validatedData.status !== undefined && validatedData.status !== currentStatus) {
      auditChanges.before.status = currentStatus
      auditChanges.after.status = validatedData.status
    }

    await auditLog({
      action: "UPDATE",
      tableName: "ot_checkins",
      recordId: checkinId.toString(),
      clientName: clientName,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: auditChanges,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCheckin.id,
        contact_id: updatedCheckin.contact_id,
        client_name: updatedCheckin.client_name,
        client_uuid: updatedCheckin.client_uuid,
        provider_name: updatedCheckin.provider_name,
        notes: updatedCheckin.notes,
        status: updatedCheckin.status,
        created_at: updatedCheckin.created_at,
        updated_at: updatedCheckin.updated_at,
      },
    })
  } catch (error) {
    console.error("Failed to update OT check-in:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to update OT check-in",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const checkinId = Number.parseInt(params.id)
    if (isNaN(checkinId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid check-in ID",
            details: { field: "id", value: params.id },
          },
        },
        { status: 400 },
      )
    }

    const existingCheckin = await sql`
      SELECT id, status, client_name, provider_name, notes FROM ot_checkins WHERE id = ${checkinId}
    `

    if (existingCheckin.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "OT check-in not found",
            details: { id: checkinId },
          },
        },
        { status: 404 },
      )
    }

    const deletedCheckin = existingCheckin[0]

    // Delete associated goals first (if any)
    await sql`
      DELETE FROM ot_goals WHERE checkin_id = ${checkinId}
    `

    // Delete the check-in
    const result = await sql`
      DELETE FROM ot_checkins WHERE id = ${checkinId}
      RETURNING id
    `

    await auditLog({
      action: "DELETE",
      tableName: "ot_checkins",
      recordId: checkinId.toString(),
      clientName: deletedCheckin.client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        deleted_record: {
          status: deletedCheckin.status,
          provider_name: deletedCheckin.provider_name,
          notes: deletedCheckin.notes,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result[0].id,
        message: "OT check-in and associated goals deleted successfully",
      },
    })
  } catch (error) {
    console.error("Failed to delete OT check-in:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to delete OT check-in",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
