import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_name, client_uuid, goal_text, target_date, priority, checkin_id } = body

    // Validation
    if (!client_name || typeof client_name !== "string" || client_name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Client name is required",
            details: { field: "client_name", value: client_name },
          },
        },
        { status: 400 },
      )
    }

    if (!client_uuid || typeof client_uuid !== "string" || client_uuid.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Client UUID is required",
            details: { field: "client_uuid", value: client_uuid },
          },
        },
        { status: 400 },
      )
    }

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

    if (priority && (typeof priority !== "number" || priority < 1 || priority > 5)) {
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

    const result = await sql`
      INSERT INTO ot_goals (client_name, client_uuid, goal_text, target_date, priority, checkin_id)
      VALUES (${client_name.trim()}, ${client_uuid.trim()}, ${goal_text.trim()}, ${target_date || null}, ${priority || 1}, ${checkin_id || null})
      RETURNING id, client_name, client_uuid, goal_text, status, target_date, priority, checkin_id, created_at, updated_at
    `

    const newGoal = result[0]

    await auditLog({
      action: "CREATE",
      tableName: "ot_goals",
      recordId: newGoal.id.toString(),
      clientName: client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        goal_text,
        target_date,
        priority: priority || 1,
        status: newGoal.status,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newGoal.id,
          client_name: newGoal.client_name,
          client_uuid: newGoal.client_uuid,
          goal_text: newGoal.goal_text,
          status: newGoal.status,
          target_date: newGoal.target_date,
          priority: newGoal.priority,
          checkin_id: newGoal.checkin_id,
          created_at: newGoal.created_at,
          updated_at: newGoal.updated_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create OT goal:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to create OT goal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
