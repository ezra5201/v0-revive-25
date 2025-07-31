import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const clientName = decodeURIComponent(params.name)

    // Get client details
    const client = await sql`
      SELECT 
        c.*,
        p.name as provider_name,
        p.location as provider_location
      FROM clients c
      JOIN providers p ON c.provider_id = p.id
      WHERE c.name = ${clientName}
    `

    if (client.length === 0) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    // Get contact history
    const contacts = await sql`
      SELECT *
      FROM contacts
      WHERE client_id = ${client[0].id}
      ORDER BY contact_date DESC
    `

    return NextResponse.json({
      success: true,
      client: client[0],
      contacts,
    })
  } catch (error) {
    console.error("Get client error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch client details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
