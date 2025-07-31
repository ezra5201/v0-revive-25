import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const trends = await sql`
      SELECT 
        year,
        month,
        SUM(shower) as shower,
        SUM(laundry) as laundry,
        SUM(meal) as meal,
        SUM(clothing) as clothing,
        SUM(case_management) as case_management,
        SUM(housing) as housing,
        SUM(medical) as medical
      FROM monthly_service_summary
      WHERE year >= EXTRACT(YEAR FROM CURRENT_DATE) - 2
      GROUP BY year, month
      ORDER BY year, month
    `

    return NextResponse.json({
      success: true,
      data: trends,
    })
  } catch (error) {
    console.error("Service trends error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch service trends" }, { status: 500 })
  }
}
