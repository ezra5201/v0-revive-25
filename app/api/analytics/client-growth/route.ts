import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const growth = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_clients
      FROM clients
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `

    return NextResponse.json({
      success: true,
      growth,
    })
  } catch (error) {
    console.error("Client growth error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch client growth data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
