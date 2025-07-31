import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const overview = await sql`
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(DISTINCT client_name) as unique_clients,
        COUNT(DISTINCT provider_name) as active_providers,
        COUNT(CASE WHEN contact_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_contacts
      FROM contacts
    `

    return NextResponse.json({ overview: overview[0] })
  } catch (error) {
    console.error("Analytics overview error:", error)
    return NextResponse.json({ overview: {} }, { status: 500 })
  }
}
