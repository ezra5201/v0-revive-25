import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { goalId: string } }) {
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

    // Check if goal exists
    const goalExists = await sql`
      SELECT id FROM cm_goals WHERE id = ${goalId}
    `

    if (goalExists.length === 0) {
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

    // Get progress history
    const progressHistory = await sql`
      SELECT 
        id,
        progress_note,
        previous_status,
        new_status,
        created_at
      FROM cm_goal_progress
      WHERE goal_id = ${goalId}
      ORDER BY created_at DESC
    `

    const formattedProgress = progressHistory.map((entry) => ({
      id: entry.id,
      progress_note: entry.progress_note,
      previous_status: entry.previous_status,
      new_status: entry.new_status,
      created_at: entry.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedProgress,
    })
  } catch (error) {
    console.error("Failed to fetch goal progress:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch goal progress",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
