import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const trends = await sql`
      SELECT 
        month_year as month,
        SUM(total_requested) as total_requested,
        SUM(total_provided) as total_provided,
        ROUND(
          (SUM(total_provided)::numeric / NULLIF(SUM(total_requested), 0)) * 100, 
          2
        ) as completion_rate,
        COUNT(DISTINCT service_name) as services_count
      FROM monthly_service_summary
      GROUP BY month_year
      ORDER BY month_year DESC
      LIMIT 12
    `

    return NextResponse.json({
      success: true,
      trends,
    })
  } catch (error) {
    console.error("Monthly trends error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch monthly trends",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
