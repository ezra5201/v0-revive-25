import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { CreateGoalSchema, validateRequest } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateRequest(CreateGoalSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    const result = await sql`
      INSERT INTO ot_goals (client_name, client_uuid, goal_text, target_date, priority, checkin_id)
      VALUES (${validatedData.client_name}, ${validatedData.client_uuid}, ${validatedData.goal_text}, 
              ${validatedData.target_date}, ${validatedData.priority}, ${validatedData.checkin_id})
      RETURNING id, client_name, client_uuid, goal_text, status, target_date, priority, checkin_id, created_at, updated_at
    `

    const newGoal = result[0]

    await auditLog({
      action: "CREATE",
      tableName: "ot_goals",
      recordId: newGoal.id.toString(),
      clientName: validatedData.client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        goal_text: validatedData.goal_text,
        target_date: validatedData.target_date,
        priority: validatedData.priority,
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
