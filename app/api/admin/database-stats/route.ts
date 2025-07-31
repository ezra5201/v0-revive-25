import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get table counts
    const contactsCount = await sql`SELECT COUNT(*) as count FROM contacts`
    const clientsCount = await sql`SELECT COUNT(*) as count FROM clients`
    const alertsCount = await sql`SELECT COUNT(*) as count FROM alerts`
    const summaryCount = await sql`SELECT COUNT(*) as count FROM monthly_service_summary`

    // Get recent activity
    const recentContacts = await sql`
      SELECT client_name, contact_date, provider_name, location
      FROM contacts 
      ORDER BY contact_date DESC, created_at DESC 
      LIMIT 5
    `

    // Get provider distribution
    const providerStats = await sql`
      SELECT provider_name, COUNT(*) as contact_count
      FROM contacts 
      WHERE provider_name IS NOT NULL
      GROUP BY provider_name
      ORDER BY contact_count DESC
    `

    // Get location distribution
    const locationStats = await sql`
      SELECT location, COUNT(*) as contact_count
      FROM contacts 
      WHERE location IS NOT NULL
      GROUP BY location
      ORDER BY contact_count DESC
    `

    return NextResponse.json({
      tableCounts: {
        contacts: Number.parseInt(contactsCount[0]?.count || "0"),
        clients: Number.parseInt(clientsCount[0]?.count || "0"),
        alerts: Number.parseInt(alertsCount[0]?.count || "0"),
        monthly_service_summary: Number.parseInt(summaryCount[0]?.count || "0"),
      },
      recentActivity: recentContacts,
      providerStats,
      locationStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json({ error: "Failed to fetch database statistics" }, { status: 500 })
  }
}
