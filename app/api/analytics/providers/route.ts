import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const providers = await sql`
      SELECT 
        COALESCE(provider_name, 'Unassigned') as provider_name,
        COUNT(*) as total_contacts,
        COUNT(DISTINCT client_name) as unique_clients,
        COUNT(DISTINCT DATE(contact_date)) as active_days
      FROM contacts
      GROUP BY provider_name
      ORDER BY total_contacts DESC
    `

    const formattedProviders = providers.map((row) => ({
      providerName: row.provider_name,
      totalContacts: Number.parseInt(row.total_contacts),
      uniqueClients: Number.parseInt(row.unique_clients),
      activeDays: Number.parseInt(row.active_days),
    }))

    return NextResponse.json({ providers: formattedProviders })
  } catch (error) {
    console.error("Error fetching provider data:", error)
    return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 })
  }
}
