import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const growth = await sql`
      SELECT 
        DATE_TRUNC('month', contact_date) as month,
        COUNT(DISTINCT name) as unique_clients,
        COUNT(*) as total_contacts
      FROM contacts 
      WHERE contact_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', contact_date)
      ORDER BY month
    `

    return NextResponse.json({
      success: true,
      data: growth.map((row) => ({
        month: row.month,
        uniqueClients: Number.parseInt(row.unique_clients),
        totalContacts: Number.parseInt(row.total_contacts),
      })),
    })
  } catch (error) {
    console.error("Client growth analytics error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch client growth data" }, { status: 500 })
  }
}
