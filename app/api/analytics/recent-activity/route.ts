import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const activity = await sql`
      SELECT 
        client_name,
        provider_name,
        service_type,
        contact_date,
        notes
      FROM contacts
      WHERE contact_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY contact_date DESC
      LIMIT 50
    `

    return NextResponse.json({ activity })
  } catch (error) {
    console.error("Recent activity error:", error)
    return NextResponse.json({ activity: [] }, { status: 500 })
  }
}
