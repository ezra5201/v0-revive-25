import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { clientName: string } }) {
  try {
    const clientName = decodeURIComponent(params.clientName)

    // Get goals for the client with latest progress note
    const goals = await sql`
      SELECT 
        g.id,
        g.client_name,
        g.goal_text,
        g.status,
        g.target_date,
        g.priority,
        g.created_at,
        g.updated_at,
        p.progress_note as latest_progress
      FROM cm_goals g
      LEFT JOIN LATERAL (
        SELECT progress_note
        FROM cm_goal_progress 
        WHERE goal_id = g.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) p ON true
      WHERE g.client_name = ${clientName}
      ORDER BY g.priority ASC, g.created_at DESC
    `

    const formattedGoals = goals.map((goal) => ({
      id: goal.id,
      client_name: goal.client_name,
      goal_text: goal.goal_text,
      status: goal.status,
      target_date: goal.target_date,
      priority: goal.priority,
      created_at: goal.created_at,
      updated_at: goal.updated_at,
      latest_progress: goal.latest_progress || null,
    }))

    return NextResponse.json({
      success: true,
      data: formattedGoals,
    })
  } catch (error) {
    console.error("Failed to fetch goals:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch goals",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
