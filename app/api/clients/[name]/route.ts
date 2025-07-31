import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const clientName = decodeURIComponent(params.name)

    // Get client basic info
    const clientInfo = await sql`
      SELECT 
        name,
        first_contact_date,
        last_contact_date,
        total_contacts,
        created_at
      FROM clients
      WHERE name = ${clientName}
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
        services_provided,
        created_at
      FROM contacts
      WHERE client_name = ${clientName}
      ORDER BY contact_date DESC, created_at DESC
    `

    // Get service summary
    const serviceSummary = await sql`
      WITH service_stats AS (
        SELECT 
          TRIM(UNNEST(STRING_TO_ARRAY(services_requested, ','))) as service_name,
          'requested' as type
        FROM contacts
        WHERE client_name = ${clientName}
        AND services_requested IS NOT NULL 
        AND services_requested != ''
        
        UNION ALL
        
        SELECT 
          TRIM(UNNEST(STRING_TO_ARRAY(services_provided, ','))) as service_name,
          'provided' as type
        FROM contacts
        WHERE client_name = ${clientName}
        AND services_provided IS NOT NULL 
        AND services_provided != ''
      )
      SELECT 
        service_name,
        COUNT(CASE WHEN type = 'requested' THEN 1 END) as requested_count,
        COUNT(CASE WHEN type = 'provided' THEN 1 END) as provided_count
      FROM service_stats
      WHERE service_name != ''
      GROUP BY service_name
      ORDER BY requested_count DESC
    `

    return NextResponse.json({
      client: clientInfo[0],
      contactHistory,
      serviceSummary,
    })
  } catch (error) {
    console.error("Client details error:", error)
    return NextResponse.json({ error: "Failed to fetch client details" }, { status: 500 })
  }
}
