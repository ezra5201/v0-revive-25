import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    // Get service statistics from contacts
    const result = await sql`
      WITH service_stats AS (
        SELECT 
          TRIM(UNNEST(STRING_TO_ARRAY(services_requested, ','))) as service_name,
          'requested' as type
        FROM contacts
        WHERE services_requested IS NOT NULL 
        AND services_requested != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
        
        UNION ALL
        
        SELECT 
          TRIM(UNNEST(STRING_TO_ARRAY(services_provided, ','))) as service_name,
          'provided' as type
        FROM contacts
        WHERE services_provided IS NOT NULL 
        AND services_provided != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
      )
      SELECT 
        service_name,
        COUNT(CASE WHEN type = 'requested' THEN 1 END) as requested_count,
        COUNT(CASE WHEN type = 'provided' THEN 1 END) as provided_count,
        ROUND(
          CASE 
            WHEN COUNT(CASE WHEN type = 'requested' THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN type = 'provided' THEN 1 END)::float / COUNT(CASE WHEN type = 'requested' THEN 1 END)::float) * 100
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM service_stats
      WHERE service_name != ''
      GROUP BY service_name
      ORDER BY requested_count DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Services analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch services data" }, { status: 500 })
  }
}
