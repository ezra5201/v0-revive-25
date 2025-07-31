import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const trends = await sql`
      SELECT 
        month_year,
        service_name,
        total_requested,
        total_provided,
        ROUND(
          (total_provided::numeric / NULLIF(total_requested, 0)) * 100, 
          2
        ) as completion_rate
      FROM monthly_service_summary
      ORDER BY month_year DESC, service_name
    `

    return NextResponse.json({
      success: true,
      trends,
    })
  } catch (error) {
    console.error("Service trends error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service trends",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
