import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        provider_name,
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN contact_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_contacts
      FROM contacts 
      WHERE provider_name IS NOT NULL
      GROUP BY provider_name
      ORDER BY total_contacts DESC
    `

    const formattedData = result.map((row) => ({
      provider: row.provider_name,
      totalContacts: Number.parseInt(row.total_contacts),
      recentContacts: Number.parseInt(row.recent_contacts),
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Failed to fetch provider data:", error)
    return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
  }
}
