import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { contactId, serviceName } = await request.json()

    if (!contactId || !serviceName) {
      return NextResponse.json({ success: false, error: "Contact ID and service name are required" }, { status: 400 })
    }

    // Get contact details to update the monthly summary
    const contact = await sql`
      SELECT 
        c.*,
        cl.location,
        p.name as provider_name
      FROM contacts c
      JOIN clients cl ON c.client_id = cl.id
      JOIN providers p ON cl.provider_id = p.id
      WHERE c.id = ${contactId}
    `

    if (contact.length === 0) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    const contactData = contact[0]
    const monthYear = new Date(contactData.contact_date).toISOString().slice(0, 7) // YYYY-MM format

    // Update or insert monthly service summary
    await sql`
      INSERT INTO monthly_service_summary (
        month_year, location, provider_name, service_name, 
        total_requested, total_provided
      )
      VALUES (
        ${monthYear}, ${contactData.location}, ${contactData.provider_name}, 
        ${serviceName}, 0, 1
      )
      ON CONFLICT (month_year, location, provider_name, service_name)
      DO UPDATE SET 
        total_provided = monthly_service_summary.total_provided + 1
    `

    // Mark the service as completed in the contact
    await sql`
      UPDATE contacts 
      SET 
        services_provided = COALESCE(services_provided, '') || 
          CASE 
            WHEN COALESCE(services_provided, '') = '' THEN ${serviceName}
            ELSE ', ' || ${serviceName}
          END
      WHERE id = ${contactId}
    `

    return NextResponse.json({
      success: true,
      message: "Service marked as completed",
    })
  } catch (error) {
    console.error("Complete service error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
