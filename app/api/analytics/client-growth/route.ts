import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const growthData = await sql`
      SELECT 
        DATE_TRUNC('month', first_contact_date) as month,
        COUNT(DISTINCT client_name) as new_clients
      FROM (
        SELECT 
          client_name,
          MIN(contact_date) as first_contact_date
        FROM contacts
        GROUP BY client_name
      ) first_contacts
      WHERE first_contact_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', first_contact_date)
      ORDER BY month
    `

    const formattedData = growthData.map((row) => ({
      month: row.month.toISOString().slice(0, 7), // YYYY-MM format
      newClients: Number.parseInt(row.new_clients),
    }))

    return NextResponse.json({ growth: formattedData })
  } catch (error) {
    console.error("Error fetching client growth data:", error)
    return NextResponse.json({ error: "Failed to fetch client growth data" }, { status: 500 })
  }
}
