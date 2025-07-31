import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const growth = await sql`
      SELECT 
        DATE_TRUNC('month', contact_date) as month,
        COUNT(DISTINCT client_name) as unique_clients
      FROM contacts
      WHERE contact_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', contact_date)
      ORDER BY month
    `

    return NextResponse.json({ growth })
  } catch (error) {
    console.error("Client growth error:", error)
    return NextResponse.json({ growth: [] }, { status: 500 })
  }
}
