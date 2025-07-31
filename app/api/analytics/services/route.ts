import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const services = await sql`
      SELECT 
        service_name,
        SUM(total_requested) as total_requested,
        SUM(total_provided) as total_provided,
        ROUND(
          (SUM(total_provided)::numeric / NULLIF(SUM(total_requested), 0)) * 100, 
          2
        ) as completion_rate,
        COUNT(DISTINCT month_year) as months_active
      FROM monthly_service_summary
      GROUP BY service_name
      ORDER BY total_requested DESC
    `

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error("Services analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch services analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
