import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const clientName = decodeURIComponent(params.name)

    // Get client basic info
    const clientInfo = await sql`
      SELECT DISTINCT
        client_name,
        MIN(contact_date) as first_contact,
        MAX(contact_date) as last_contact,
        COUNT(*) as total_contacts
      FROM contacts
      WHERE client_name = ${clientName}
      GROUP BY client_name
    `

    if (clientInfo.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get contact history
    const contactHistory = await sql`
      SELECT 
        id,
        contact_date,
        provider_name,
        location,
        services_requested,
        services_provided
      FROM contacts
      WHERE client_name = ${clientName}
      ORDER BY contact_date DESC
    `

    return NextResponse.json({
      client: clientInfo[0],
      contacts: contactHistory,
    })
  } catch (error) {
    console.error("Error fetching client data:", error)
    return NextResponse.json({ error: "Failed to fetch client data" }, { status: 500 })
  }
}
