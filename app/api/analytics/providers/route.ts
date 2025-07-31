import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    const result = await sql`
      SELECT 
        provider_name,
        COUNT(*) as total_contacts,
        COUNT(DISTINCT client_name) as unique_clients,
        COUNT(DISTINCT location) as locations_served
      FROM contacts
      WHERE provider_name IS NOT NULL
      AND contact_date >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY provider_name
      ORDER BY total_contacts DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Provider analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
  }
}
