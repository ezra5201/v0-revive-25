import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const alerts = await sql`
      SELECT id, client_name, alert_type, message, severity, created_at
      FROM alerts 
      WHERE resolved_at IS NULL
      ORDER BY 
        CASE severity 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at DESC
    `

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { clientName, alertType, message, severity = "medium" } = await request.json()

    if (!clientName || !alertType || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO alerts (client_name, alert_type, message, severity)
      VALUES (${clientName}, ${alertType}, ${message}, ${severity})
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      alertId: result[0]?.id,
    })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}
