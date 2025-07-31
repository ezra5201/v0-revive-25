import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const stats = await sql`
      SELECT 
        'contacts' as table_name,
        COUNT(*) as record_count
      FROM contacts
      UNION ALL
      SELECT 
        'monthly_service_summary' as table_name,
        COUNT(*) as record_count
      FROM monthly_service_summary
    `

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch database stats" }, { status: 500 })
  }
}
