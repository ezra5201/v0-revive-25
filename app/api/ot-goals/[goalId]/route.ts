import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { goalId: string } }) {
  try {
    const goalId = Number.parseInt(params.goalId)
    if (isNaN(goalId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid goal ID",
            details: { field: "goalId", value: params.goalId },
          },
        },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { status, progress_note } = body

    // Validation
    const validStatuses = ["Not Started", "In Progress", "Completed", "Deferred"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Status must be one of: " + validStatuses.join(", "),
            details: { field: "status", value: status },
          },
        },
        { status: 400 },
      )
    }

    if (progress_note && progress_note.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Progress note must be 1000 characters or less",
            details: { field: "progress_note", value: progress_note },
          },
        },
        { status: 400 },
      )
    }

    const existingGoal = await sql`
      SELECT id, status FROM ot_goals WHERE id = ${goalId}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "OT goal not found",
            details: { goalId },
          },
        },
        { status: 404 },
      )
    }

    const previousStatus = existingGoal[0].status

    const updatedGoal = await sql`
      UPDATE ot_goals 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${goalId}
      RETURNING id, status, updated_at
    `

    if (progress_note || previousStatus !== status) {
      await sql`
        INSERT INTO ot_goal_progress (goal_id, progress_note, previous_status, new_status)
        VALUES (${goalId}, ${progress_note || null}, ${previousStatus}, ${status})
      `
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedGoal[0].id,
        status: updatedGoal[0].status,
        updated_at: updatedGoal[0].updated_at,
      },
    })
  } catch (error) {
    console.error("Failed to update OT goal:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to update OT goal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
