import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const alerts = await sql`
      SELECT 
        id,
        client_name,
        alert_type,
        message,
        created_at,
        is_resolved
      FROM alerts 
      WHERE is_resolved = false
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      alerts,
    })
  } catch (error) {
    console.error("Fetch alerts error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}
