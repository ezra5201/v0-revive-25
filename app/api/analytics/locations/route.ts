import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("Fetching location performance data...")

    const query = `
      SELECT 
        COALESCE(location, 'Unknown') as location,
        COUNT(*) as visits,
        COUNT(DISTINCT client_name) as total_clients,
        COUNT(CASE WHEN provider_name IS NOT NULL AND provider_name != '' THEN 1 END) as total_engaged,
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND((COUNT(CASE WHEN provider_name IS NOT NULL AND provider_name != '' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)
          ELSE 0 
        END as engagement_rate
      FROM contacts 
      GROUP BY COALESCE(location, 'Unknown')
      ORDER BY visits DESC
      LIMIT 50
    `

    console.log("Executing location query:", query)
    const result = await sql(query)
    console.log("Location query result:", result)

    const locations = result.map((row) => ({
      location: row.location,
      visits: Number.parseInt(row.visits),
      totalClients: Number.parseInt(row.total_clients),
      totalEngaged: Number.parseInt(row.total_engaged),
      engagementRate: Number.parseFloat(row.engagement_rate),
    }))

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("Error fetching location analytics:", error)
    return NextResponse.json({ error: "Failed to fetch location analytics" }, { status: 500 })
  }
}
