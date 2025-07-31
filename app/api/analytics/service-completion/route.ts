import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const result = await sql`
      WITH service_completion AS (
        SELECT 
          TRIM(UNNEST(STRING_TO_ARRAY(services_requested, ','))) as service_name,
          CASE 
            WHEN services_provided IS NOT NULL 
            AND services_provided != ''
            AND TRIM(UNNEST(STRING_TO_ARRAY(services_requested, ','))) = ANY(STRING_TO_ARRAY(services_provided, ','))
            THEN 'completed'
            ELSE 'pending'
          END as status
        FROM contacts
        WHERE services_requested IS NOT NULL 
        AND services_requested != ''
        AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
      )
      SELECT 
        service_name,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        ROUND(
          CASE 
            WHEN COUNT(*) > 0 
            THEN (COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)::float) * 100
            ELSE 0 
          END, 2
        ) as completion_rate
      FROM service_completion
      WHERE service_name != ''
      GROUP BY service_name
      ORDER BY total_requests DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Service completion analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch service completion data" }, { status: 500 })
  }
}
