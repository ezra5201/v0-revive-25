import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "90"

    const result = await sql`
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', contact_date) as month,
          TRIM(UNNEST(STRING_TO_ARRAY(services_requested, ','))) as service_name,
          'requested' as type
        FROM contacts
        WHERE services_requested IS NOT NULL 
        AND services_requested != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
        
        UNION ALL
        
        SELECT 
          DATE_TRUNC('month', contact_date) as month,
          TRIM(UNNEST(STRING_TO_ARRAY(services_provided, ','))) as service_name,
          'provided' as type
        FROM contacts
        WHERE services_provided IS NOT NULL 
        AND services_provided != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
      )
      SELECT 
        TO_CHAR(month, 'YYYY-MM') as month_year,
        service_name,
        COUNT(CASE WHEN type = 'requested' THEN 1 END) as total_requested,
        COUNT(CASE WHEN type = 'provided' THEN 1 END) as total_provided,
        ROUND(
          CASE 
            WHEN COUNT(CASE WHEN type = 'requested' THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN type = 'provided' THEN 1 END)::float / COUNT(CASE WHEN type = 'requested' THEN 1 END)::float) * 100
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM monthly_data
      WHERE service_name != ''
      GROUP BY month, service_name
      ORDER BY month DESC, total_requested DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Monthly trends analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch monthly trends data" }, { status: 500 })
  }
}
