import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const result = await sql`
      WITH daily_services AS (
        SELECT 
          contact_date,
          TRIM(UNNEST(STRING_TO_ARRAY(services_requested, ','))) as service_name,
          'requested' as type
        FROM contacts
        WHERE services_requested IS NOT NULL 
        AND services_requested != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
        
        UNION ALL
        
        SELECT 
          contact_date,
          TRIM(UNNEST(STRING_TO_ARRAY(services_provided, ','))) as service_name,
          'provided' as type
        FROM contacts
        WHERE services_provided IS NOT NULL 
        AND services_provided != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
      )
      SELECT 
        contact_date,
        service_name,
        COUNT(CASE WHEN type = 'requested' THEN 1 END) as requested,
        COUNT(CASE WHEN type = 'provided' THEN 1 END) as provided
      FROM daily_services
      WHERE service_name != ''
      GROUP BY contact_date, service_name
      ORDER BY contact_date, service_name
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Service trends error:", error)
    return NextResponse.json({ error: "Failed to fetch service trends" }, { status: 500 })
  }
}
