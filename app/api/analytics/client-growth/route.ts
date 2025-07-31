import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_clients,
        SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_clients
      FROM clients 
      WHERE created_at >= '2019-01-01'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `

    const formattedData = result.map((row) => ({
      month: new Date(row.month).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
      newClients: Number.parseInt(row.new_clients),
      totalClients: Number.parseInt(row.cumulative_clients),
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Failed to fetch client growth data:", error)
    return NextResponse.json({ error: "Failed to fetch client growth data" }, { status: 500 })
  }
}
