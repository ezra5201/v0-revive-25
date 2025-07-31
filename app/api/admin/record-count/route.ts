import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        (SELECT COUNT(*) FROM providers) as providers,
        (SELECT COUNT(*) FROM clients) as clients,
        (SELECT COUNT(*) FROM contacts) as contacts,
        (SELECT COUNT(*) FROM monthly_service_summary) as monthly_summaries
    `

    return NextResponse.json({
      success: true,
      counts: result[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Record count error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch record counts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
