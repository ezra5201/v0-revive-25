import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const clientName = decodeURIComponent(params.name)
    const sql = neon(process.env.DATABASE_URL!)

    // Get client's contact history
    const contacts = await sql`
      SELECT 
        id,
        name,
        contact_date,
        services,
        provider,
        notes,
        created_at
      FROM contacts 
      WHERE name = ${clientName}
      ORDER BY contact_date DESC, created_at DESC
    `

    // Get client's service summary
    const serviceSummary = await sql`
      SELECT 
        month,
        year,
        shower, laundry, meal, clothing, mail, phone, computer,
        case_management, benefits, housing, medical, mental_health,
        substance_abuse, legal, transportation, id_docs, storage, other
      FROM monthly_service_summary
      WHERE client_name = ${clientName}
      ORDER BY year DESC, month DESC
    `

    return NextResponse.json({
      success: true,
      client: {
        name: clientName,
        contacts,
        serviceSummary,
      },
    })
  } catch (error) {
    console.error("Get client error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch client data" }, { status: 500 })
  }
}
