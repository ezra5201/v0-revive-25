import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const result = await sql`
      SELECT 
        location,
        COUNT(*) as total_visits,
        COUNT(DISTINCT client_name) as total_clients,
        COUNT(DISTINCT CASE 
          WHEN services_provided IS NOT NULL 
          AND services_provided != '' 
          THEN client_name 
        END) as engaged_clients,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT client_name) > 0 
            THEN (COUNT(DISTINCT CASE 
              WHEN services_provided IS NOT NULL 
              AND services_provided != '' 
              THEN client_name 
            END)::float / COUNT(DISTINCT client_name)::float) * 100
            ELSE 0 
          END, 1
        ) as engagement_rate
      FROM contacts
      WHERE location IS NOT NULL
      AND location != ''
      AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY location
      ORDER BY total_visits DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Location analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 })
  }
}
