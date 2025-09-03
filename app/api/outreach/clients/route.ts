import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const clients = await sql`
      SELECT id, first_name, last_name, ces_number
      FROM outreach_clients 
      WHERE is_active = true
      ORDER BY 
        CASE 
          WHEN last_name IS NOT NULL THEN last_name
          WHEN first_name IS NOT NULL THEN first_name
          ELSE 'zzz'
        END ASC
      LIMIT 100
    `

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}
