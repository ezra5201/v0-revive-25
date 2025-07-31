import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const recentActivity = await sql`
      SELECT 
        name,
        contact_date,
        services,
        provider,
        notes
      FROM contacts 
      ORDER BY contact_date DESC, created_at DESC
      LIMIT 50
    `

    return NextResponse.json({
      success: true,
      data: recentActivity,
    })
  } catch (error) {
    console.error("Recent activity error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch recent activity" }, { status: 500 })
  }
}
