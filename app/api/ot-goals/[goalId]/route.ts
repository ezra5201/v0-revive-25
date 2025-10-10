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
      SELECT id, status, goal_text, target_date, priority, client_name FROM ot_goals WHERE id = ${goalId}
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
    const previousGoalText = goalRecord.goal_text
    const previousTargetDate = goalRecord.target_date
    const previousPriority = goalRecord.priority
    const clientName = goalRecord.client_name

    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (validatedData.goal_text !== undefined) {
      updateFields.push(`goal_text = $${paramIndex}`)
      updateValues.push(validatedData.goal_text)
      paramIndex++
    }
    if (validatedData.target_date !== undefined) {
      updateFields.push(`target_date = $${paramIndex}`)
      updateValues.push(validatedData.target_date)
      paramIndex++
    }
    if (validatedData.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`)
      updateValues.push(validatedData.priority)
      paramIndex++
    }
    if (validatedData.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      updateValues.push(validatedData.status)
      paramIndex++
    }
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    updateValues.push(goalId)

    const updateQuery = `
      UPDATE ot_goals 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, goal_text, target_date, priority, status, updated_at
    `

    const result = await sql.query(updateQuery, updateValues)
    const updatedGoal = result[0]

    console.log("DEBUG: Updated goal result:", updatedGoal)

    if (!updatedGoal || !updatedGoal.id) {
      console.error("DEBUG: Invalid updated record:", updatedGoal)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Invalid updated record",
            details: { goalId, record: updatedGoal },
          },
        },
        { status: 500 },
      )
    }

    const auditChanges: any = { before: {}, after: {} }
    if (validatedData.goal_text !== undefined) {
      auditChanges.before.goal_text = previousGoalText
      auditChanges.after.goal_text = updatedGoal.goal_text
    }
    if (validatedData.target_date !== undefined) {
      auditChanges.before.target_date = previousTargetDate
      auditChanges.after.target_date = updatedGoal.target_date
    }
    if (validatedData.priority !== undefined) {
      auditChanges.before.priority = previousPriority
      auditChanges.after.priority = updatedGoal.priority
    }
    if (validatedData.status !== undefined) {
      auditChanges.before.status = previousStatus
      auditChanges.after.status = updatedGoal.status
    }
    if (validatedData.progress_note) {
      auditChanges.progress_note = validatedData.progress_note
    }

    await auditLog({
      action: "UPDATE",
      tableName: "ot_goals",
      recordId: goalId.toString(),
      clientName: clientName,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: auditChanges,
    })

    if (validatedData.progress_note || (validatedData.status && previousStatus !== validatedData.status)) {
      await sql`
        INSERT INTO ot_goal_progress (goal_id, progress_note, previous_status, new_status)
        VALUES (${goalId}, ${validatedData.progress_note || null}, ${previousStatus}, ${validatedData.status || previousStatus})
      `
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedGoal.id,
        goal_text: updatedGoal.goal_text,
        target_date: updatedGoal.target_date,
        priority: updatedGoal.priority,
        status: updatedGoal.status,
        updated_at: updatedGoal.updated_at,
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

    const existingGoal = await sql`
      SELECT id, client_name, goal_text, status, priority FROM ot_goals WHERE id = ${goalId}
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

    const deletedGoal = existingGoal[0]

    await sql`DELETE FROM ot_goals WHERE id = ${goalId}`

    await auditLog({
      action: "DELETE",
      tableName: "ot_goals",
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
      data: { id: goalId, message: "OT goal deleted successfully" },
    })
  } catch (error) {
    console.error("Failed to delete OT goal:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to delete OT goal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
