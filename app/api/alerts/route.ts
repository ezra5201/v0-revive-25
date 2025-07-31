import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const alerts = await sql`
      SELECT 
        a.*,
        c.name as client_name,
        c.location
      FROM alerts a
      JOIN clients c ON a.client_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      alerts,
    })
  } catch (error) {
    console.error("Fetch alerts error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch alerts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { clientId, type, message, severity = "medium" } = await request.json()

    if (!clientId || !type || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO alerts (client_id, type, message, severity, created_at)
      VALUES (${clientId}, ${type}, ${message}, ${severity}, NOW())
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      alert: result[0],
    })
  } catch (error) {
    console.error("Create alert error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create alert",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
