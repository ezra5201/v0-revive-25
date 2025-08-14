import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

interface UpdateCheckinRequest {
  notes?: string
  status?: "Draft" | "Completed"
}

const VALID_STATUSES = ["Draft", "Completed", "Cancelled"] as const
const VALID_STATUS_TRANSITIONS = {
  Draft: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
} as const

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

    const body: UpdateCheckinRequest = await request.json()
    const { notes, status } = body

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid status value",
            details: { field: "status", value: status, validValues: VALID_STATUSES },
          },
        },
        { status: 400 },
      )
    }

    // Get current check-in to validate status transition
    const currentCheckin = await sql`
      SELECT id, status FROM cm_checkins WHERE id = ${checkinId}
    `

    if (currentCheckin.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Check-in not found",
            details: { id: checkinId },
          },
        },
        { status: 404 },
      )
    }

    const currentStatus = currentCheckin[0].status as keyof typeof VALID_STATUS_TRANSITIONS

    // Validate status transition if status is being updated
    if (status && status !== currentStatus) {
      const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus]
      if (!allowedTransitions.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid status transition from ${currentStatus} to ${status}`,
              details: {
                currentStatus,
                requestedStatus: status,
                allowedTransitions,
              },
            },
          },
          { status: 400 },
        )
      }
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`)
      updateValues.push(notes)
      paramIndex++
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      updateValues.push(status)
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
      UPDATE cm_checkins 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, contact_id, client_name, client_uuid, provider_name, notes, status, created_at, updated_at
    `

    const result = await sql.query(updateQuery, updateValues)
    const updatedCheckin = result[0]

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
    console.error("Failed to update check-in:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to update check-in",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
