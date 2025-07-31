import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceFilter = searchParams.get("service")

    console.log("Fetching service completion data...", { serviceFilter })

    let query = `
      SELECT 
        service_name,
        SUM(total_requested) as total_requested,
        SUM(total_provided) as total_provided,
        CASE 
          WHEN SUM(total_requested) > 0 
          THEN ROUND((SUM(total_provided)::numeric / SUM(total_requested)::numeric) * 100, 2)
          ELSE 0 
        END as completion_rate,
        COUNT(DISTINCT CONCAT(year, '-', month)) as months_active
      FROM monthly_service_summary
    `

    if (serviceFilter) {
      query += ` WHERE service_name = $1`
    }

    query += `
      GROUP BY service_name
      ORDER BY total_requested DESC
    `

    console.log("Executing service completion query:", query)
    const result = serviceFilter ? await sql(query, [serviceFilter]) : await sql(query)
    console.log("Service completion query result:", result)

    const services = result.map((row) => ({
      serviceName: row.service_name,
      totalRequested: Number.parseInt(row.total_requested),
      totalProvided: Number.parseInt(row.total_provided),
      completionRate: Number.parseFloat(row.completion_rate),
      monthsActive: Number.parseInt(row.months_active),
    }))

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching service completion analytics:", error)
    return NextResponse.json({ error: "Failed to fetch service completion analytics" }, { status: 500 })
  }
}
