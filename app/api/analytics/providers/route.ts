import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const providers = await sql`
      SELECT 
        provider_name,
        COUNT(*) as contact_count,
        COUNT(DISTINCT client_name) as unique_clients
      FROM contacts
      WHERE provider_name IS NOT NULL
      GROUP BY provider_name
      ORDER BY contact_count DESC
      LIMIT 20
    `

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Provider analytics error:", error)
    return NextResponse.json({ providers: [] }, { status: 500 })
  }
}
