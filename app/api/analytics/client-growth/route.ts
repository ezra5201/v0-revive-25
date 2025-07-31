import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const result = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_clients
      FROM clients
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Client growth analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch client growth data" }, { status: 500 })
  }
}
