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
        ROUND(AVG(completion_rate), 2) as avg_completion_rate
      FROM monthly_service_summary
      GROUP BY service_name
      ORDER BY total_requested DESC
    `

    const formattedServices = services.map((row) => ({
      serviceName: row.service_name,
      totalRequested: Number.parseInt(row.total_requested),
      totalProvided: Number.parseInt(row.total_provided),
      avgCompletionRate: Number.parseFloat(row.avg_completion_rate),
    }))

    return NextResponse.json({ services: formattedServices })
  } catch (error) {
    console.error("Error fetching services data:", error)
    return NextResponse.json({ error: "Failed to fetch services data" }, { status: 500 })
  }
}
