import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const recentActivity = await sql`
      SELECT 
        c.contact_date,
        c.contact_type,
        cl.name as client_name,
        cl.location,
        p.name as provider_name,
        c.notes
      FROM contacts c
      JOIN clients cl ON c.client_id = cl.id
      JOIN providers p ON cl.provider_id = p.id
      ORDER BY c.contact_date DESC
      LIMIT 20
    `

    return NextResponse.json({
      success: true,
      activities: recentActivity,
    })
  } catch (error) {
    console.error("Recent activity error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recent activity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
