import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("Fetching monthly trends data...")

    const query = `
      SELECT 
        CONCAT(year, '-', LPAD(month::text, 2, '0')) as month,
        SUM(total_requested) as total_requested,
        SUM(total_provided) as total_provided,
        CASE 
          WHEN SUM(total_requested) > 0 
          THEN ROUND((SUM(total_provided)::numeric / SUM(total_requested)::numeric) * 100, 2)
          ELSE 0 
        END as completion_rate,
        COUNT(DISTINCT service_name) as services_count
      FROM monthly_service_summary 
      GROUP BY year, month
      ORDER BY year ASC, month ASC
    `

    console.log("Executing monthly trends query:", query)
    const result = await sql(query)

    const trends = result.map((row) => ({
      month: row.month,
      totalRequested: Number.parseInt(row.total_requested),
      totalProvided: Number.parseInt(row.total_provided),
      completionRate: Number.parseFloat(row.completion_rate),
      servicesCount: Number.parseInt(row.services_count),
    }))

    console.log(`Found ${trends.length} monthly trend records`)
    return NextResponse.json({ trends })
  } catch (error) {
    console.error("Error fetching monthly trends data:", error)
    return NextResponse.json({ error: "Failed to fetch monthly trends data" }, { status: 500 })
  }
}
