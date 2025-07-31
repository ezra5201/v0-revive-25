import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get table counts
    const tables = ["providers", "clients", "contacts", "monthly_service_summary"]

    const stats = {}

    for (const table of tables) {
      const result = await sql`
        SELECT COUNT(*) as count 
        FROM ${sql(table)}
      `
      stats[table] = Number.parseInt(result[0].count)
    }

    // Get recent activity
    const recentContacts = await sql`
      SELECT COUNT(*) as count
      FROM contacts 
      WHERE contact_date >= CURRENT_DATE - INTERVAL '7 days'
    `

    stats["recent_contacts_7_days"] = Number.parseInt(recentContacts[0].count)

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch database statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
