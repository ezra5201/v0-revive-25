import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get record counts for all tables
    const contactsCount = await sql`SELECT COUNT(*) as count FROM contacts`
    const summaryCount = await sql`SELECT COUNT(*) as count FROM monthly_service_summary`

    return NextResponse.json({
      success: true,
      counts: {
        contacts: Number.parseInt(contactsCount[0].count),
        monthly_service_summary: Number.parseInt(summaryCount[0].count),
      },
    })
  } catch (error) {
    console.error("Record count error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch record counts" }, { status: 500 })
  }
}
