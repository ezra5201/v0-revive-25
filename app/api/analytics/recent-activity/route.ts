import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const recentActivity = await sql`
      SELECT 
        client_name,
        contact_date,
        provider_name,
        location,
        services_requested,
        services_provided
      FROM contacts
      ORDER BY contact_date DESC
      LIMIT 50
    `

    const formattedActivity = recentActivity.map((row) => ({
      clientName: row.client_name,
      contactDate: row.contact_date,
      providerName: row.provider_name,
      location: row.location,
      servicesRequested: row.services_requested,
      servicesProvided: row.services_provided,
    }))

    return NextResponse.json({ activity: formattedActivity })
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
  }
}
