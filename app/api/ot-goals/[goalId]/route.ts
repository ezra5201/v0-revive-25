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
    const { status, progress_note, goal_text, target_date, priority } = body

    // Check if this is a full goal update or just status update
    const isFullUpdate = goal_text !== undefined || target_date !== undefined || priority !== undefined

    if (isFullUpdate) {
      // Full goal update validation
      if (goal_text !== undefined) {
        if (!goal_text || typeof goal_text !== "string" || goal_text.trim().length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Goal text is required",
                details: { field: "goal_text", value: goal_text },
              },
            },
            { status: 400 },
          )
        }

        if (goal_text.length > 500) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Goal text must be 500 characters or less",
                details: { field: "goal_text", value: goal_text },
              },
            },
            { status: 400 },
          )
        }
      }

      if (priority !== undefined && (typeof priority !== "number" || priority < 1 || priority > 5)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Priority must be between 1 and 5",
              details: { field: "priority", value: priority },
            },
          },
          { status: 400 },
        )
      }
    }

    // Status validation (for both update types)
    if (status !== undefined) {
      const validStatuses = ["Not Started", "In Progress", "Completed", "Deferred"]
      if (!validStatuses.includes(status)) {
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
      SELECT id, status, goal_text, target_date, priority FROM ot_goals WHERE id = ${goalId}
    `

    console.log("DEBUG: Database query for goalId:", goalId)
    console.log("DEBUG: existingGoal result:", existingGoal)

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

    const goalRecord = existingGoal[0]
    if (!goalRecord || !goalRecord.id) {
      console.error("DEBUG: Invalid goal record:", goalRecord)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Invalid goal record retrieved",
            details: { goalId, record: goalRecord },
          },
        },
        { status: 500 },
      )
    }

    const previousStatus = goalRecord.status

    const updateFields = []
    const updateValues = []

    if (goal_text !== undefined) {
      updateFields.push("goal_text = $" + (updateValues.length + 1))
      updateValues.push(goal_text.trim())
    }

    if (target_date !== undefined) {
      updateFields.push("target_date = $" + (updateValues.length + 1))
      updateValues.push(target_date || null)
    }

    if (priority !== undefined) {
      updateFields.push("priority = $" + (updateValues.length + 1))
      updateValues.push(priority)
    }

    if (status !== undefined) {
      updateFields.push("status = $" + (updateValues.length + 1))
      updateValues.push(status)
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateFields.push("id = $" + (updateValues.length + 1))
    updateValues.push(goalId)

    const updateQuery = `
      UPDATE ot_goals 
      SET ${updateFields.slice(0, -1).join(", ")}
      WHERE ${updateFields[updateFields.length - 1]}
      RETURNING id, goal_text, target_date, priority, status, updated_at
    `

    const updatedGoal = await sql.unsafe(updateQuery, updateValues)

    // Create progress entry if status changed or progress note provided
    if (progress_note || (status && previousStatus !== status)) {
      await sql`
        INSERT INTO ot_goal_progress (goal_id, progress_note, previous_status, new_status)
        VALUES (${goalId}, ${progress_note || null}, ${previousStatus}, ${status || previousStatus})
      `
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedGoal[0].id,
        goal_text: updatedGoal[0].goal_text,
        target_date: updatedGoal[0].target_date,
        priority: updatedGoal[0].priority,
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
