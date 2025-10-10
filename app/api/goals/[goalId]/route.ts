import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { UpdateGoalSchema, validateRequest } from "@/lib/validations"

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

    const validation = validateRequest(UpdateGoalSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    const existingGoal = await sql`
      SELECT id, status, client_name FROM cm_goals WHERE id = ${goalId}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Goal not found",
            details: { goalId },
          },
        },
        { status: 404 },
      )
    }

    const previousStatus = existingGoal[0].status
    const clientName = existingGoal[0].client_name

    // Update the goal status
    const updatedGoal = await sql`
      UPDATE cm_goals 
      SET status = ${validatedData.status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${goalId}
      RETURNING id, status, updated_at
    `

    await auditLog({
      action: "UPDATE",
      tableName: "cm_goals",
      recordId: goalId.toString(),
      clientName: clientName,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        before: { status: previousStatus },
        after: { status: validatedData.status },
        progress_note: validatedData.progress_note || undefined,
      },
    })

    // Create progress entry if there's a note or status change
    if (validatedData.progress_note || previousStatus !== validatedData.status) {
      await sql`
        INSERT INTO cm_goal_progress (goal_id, progress_note, previous_status, new_status)
        VALUES (${goalId}, ${validatedData.progress_note || null}, ${previousStatus}, ${validatedData.status})
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
    console.error("Failed to update goal:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to update goal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { goalId: string } }) {
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

    // Get data BEFORE delete for audit logging
    const existingGoal = await sql`
      SELECT id, client_name, goal_text, status, priority FROM cm_goals WHERE id = ${goalId}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Goal not found",
            details: { goalId },
          },
        },
        { status: 404 },
      )
    }

    const deletedGoal = existingGoal[0]

    // Delete the goal
    await sql`DELETE FROM cm_goals WHERE id = ${goalId}`

    // Add audit logging after successful delete
    await auditLog({
      action: "DELETE",
      tableName: "cm_goals",
      recordId: goalId.toString(),
      clientName: deletedGoal.client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        deleted_record: {
          goal_text: deletedGoal.goal_text,
          status: deletedGoal.status,
          priority: deletedGoal.priority,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: { id: goalId, message: "Goal deleted successfully" },
    })
  } catch (error) {
    console.error("Failed to delete goal:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to delete goal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
