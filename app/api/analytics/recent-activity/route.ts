import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "10"

    const result = await sql`
      SELECT 
        client_name,
        contact_date,
        provider_name,
        location,
        services_requested,
        services_provided,
        created_at
      FROM contacts
      ORDER BY contact_date DESC, created_at DESC
      LIMIT ${Number.parseInt(limit)}
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Recent activity error:", error)
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
  }
}
