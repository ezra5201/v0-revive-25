import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get basic counts
    const totalContacts = await sql`SELECT COUNT(*) as count FROM contacts`
    const uniqueClients = await sql`SELECT COUNT(DISTINCT name) as count FROM contacts`
    const thisMonthContacts = await sql`
      SELECT COUNT(*) as count FROM contacts 
      WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
    `

    // Get service usage
    const serviceUsage = await sql`
      SELECT 
        services,
        COUNT(*) as usage_count
      FROM contacts 
      WHERE services IS NOT NULL AND services != ''
      GROUP BY services
      ORDER BY usage_count DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      overview: {
        totalContacts: Number.parseInt(totalContacts[0].count),
        uniqueClients: Number.parseInt(uniqueClients[0].count),
        thisMonthContacts: Number.parseInt(thisMonthContacts[0].count),
        topServices: serviceUsage,
      },
    })
  } catch (error) {
    console.error("Analytics overview error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics overview" }, { status: 500 })
  }
}
