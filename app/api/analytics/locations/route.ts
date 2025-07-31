import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const locations = await sql`
      SELECT 
        c.location,
        COUNT(DISTINCT co.id) as visits,
        COUNT(DISTINCT c.id) as total_clients,
        COUNT(DISTINCT CASE WHEN co.id IS NOT NULL THEN c.id END) as total_engaged,
        ROUND(
          (COUNT(DISTINCT CASE WHEN co.id IS NOT NULL THEN c.id END)::numeric / 
           NULLIF(COUNT(DISTINCT c.id), 0)) * 100, 
          2
        ) as engagement_rate
      FROM clients c
      LEFT JOIN contacts co ON c.id = co.client_id
      GROUP BY c.location
      ORDER BY engagement_rate DESC, total_clients DESC
    `

    return NextResponse.json({
      success: true,
      locations,
    })
  } catch (error) {
    console.error("Location analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch location analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
