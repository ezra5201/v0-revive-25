import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const counts = await Promise.all([
      sql`SELECT COUNT(*) as count FROM contacts`,
      sql`SELECT COUNT(*) as count FROM clients`,
      sql`SELECT COUNT(*) as count FROM monthly_service_summary`,
    ])

    return NextResponse.json({
      contacts: Number.parseInt(counts[0][0].count),
      clients: Number.parseInt(counts[1][0].count),
      monthlyServiceSummary: Number.parseInt(counts[2][0].count),
    })
  } catch (error) {
    console.error("Record count error:", error)
    return NextResponse.json({ error: "Failed to fetch record counts" }, { status: 500 })
  }
}
