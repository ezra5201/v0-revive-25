import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const runId = Number.parseInt(params.id)

    // Handle status updates
    if (body.status) {
      const result = await sql`
        UPDATE outreach_runs 
        SET status = ${body.status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${runId}
        RETURNING *
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Run not found" }, { status: 404 })
      }

      return NextResponse.json(result[0])
    }

    // Handle full run updates
    const { run_date, run_time, lead_staff, team_members, planned_locations, safety_notes } = body

    const result = await sql`
      UPDATE outreach_runs 
      SET run_date = ${run_date},
          run_time = ${run_time || null},
          lead_staff = ${lead_staff},
          team_members = ${team_members},
          planned_locations = ${planned_locations},
          safety_notes = ${safety_notes || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${runId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating run:", error)
    return NextResponse.json({ error: "Failed to update run" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const runId = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM outreach_runs 
      WHERE id = ${runId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Run deleted successfully" })
  } catch (error) {
    console.error("Error deleting run:", error)
    return NextResponse.json({ error: "Failed to delete run" }, { status: 500 })
  }
}
