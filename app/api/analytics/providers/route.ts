import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const providers = await sql`
      SELECT 
        p.name,
        p.location,
        COUNT(DISTINCT c.id) as total_clients,
        COUNT(co.id) as total_contacts,
        ROUND(
          COUNT(co.id)::numeric / NULLIF(COUNT(DISTINCT c.id), 0), 
          2
        ) as avg_contacts_per_client
      FROM providers p
      LEFT JOIN clients c ON p.id = c.provider_id
      LEFT JOIN contacts co ON c.id = co.client_id
      GROUP BY p.id, p.name, p.location
      ORDER BY total_contacts DESC
    `

    return NextResponse.json({
      success: true,
      providers,
    })
  } catch (error) {
    console.error("Provider analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch provider analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
