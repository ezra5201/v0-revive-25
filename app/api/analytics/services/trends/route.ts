import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const trends = await sql`
      SELECT 
        service_name,
        year,
        month,
        total_requested,
        total_provided,
        completion_rate
      FROM monthly_service_summary
      ORDER BY service_name, year, month
    `

    const formattedTrends = trends.map((row) => ({
      serviceName: row.service_name,
      year: row.year,
      month: row.month,
      totalRequested: Number.parseInt(row.total_requested),
      totalProvided: Number.parseInt(row.total_provided),
      completionRate: Number.parseFloat(row.completion_rate),
    }))

    return NextResponse.json({ trends: formattedTrends })
  } catch (error) {
    console.error("Error fetching service trends:", error)
    return NextResponse.json({ error: "Failed to fetch service trends" }, { status: 500 })
  }
}
