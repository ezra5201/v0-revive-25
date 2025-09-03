import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const runs = await sql`
      SELECT * FROM outreach_runs 
      ORDER BY run_date DESC, run_time DESC
    `

    return NextResponse.json(runs)
  } catch (error) {
    console.error("Error fetching runs:", error)
    return NextResponse.json({ error: "Failed to fetch runs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { run_date, run_time, lead_staff, team_members, planned_locations, safety_notes } = body

    const result = await sql`
      INSERT INTO outreach_runs (
        run_date, 
        run_time, 
        lead_staff, 
        team_members, 
        planned_locations, 
        safety_notes
      )
      VALUES (
        ${run_date}, 
        ${run_time || null}, 
        ${lead_staff}, 
        ${team_members}, 
        ${planned_locations}, 
        ${safety_notes || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating run:", error)
    return NextResponse.json({ error: "Failed to create run" }, { status: 500 })
  }
}
