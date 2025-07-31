import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const providers = await sql`
      SELECT 
        provider,
        COUNT(*) as contact_count,
        COUNT(DISTINCT name) as unique_clients
      FROM contacts 
      WHERE provider IS NOT NULL
      GROUP BY provider
      ORDER BY contact_count DESC
    `

    return NextResponse.json({
      success: true,
      data: providers.map((row) => ({
        provider: row.provider,
        contactCount: Number.parseInt(row.contact_count),
        uniqueClients: Number.parseInt(row.unique_clients),
      })),
    })
  } catch (error) {
    console.error("Provider analytics error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch provider analytics" }, { status: 500 })
  }
}
