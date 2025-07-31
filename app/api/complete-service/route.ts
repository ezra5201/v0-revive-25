import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { contactIds, serviceName, providerName } = body

    // Validate required fields
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 })
    }

    if (!serviceName || !providerName) {
      return NextResponse.json({ error: "Service name and provider name are required" }, { status: 400 })
    }

    const completedContacts = []

    // Process each contact
    for (const contactId of contactIds) {
      try {
        // Get current contact data
        const contactResult = await sql.query(
          "SELECT id, services_requested, services_provided FROM contacts WHERE id = $1",
          [contactId],
        )

        if (contactResult.length === 0) {
          console.warn(`Contact ${contactId} not found`)
          continue
        }

        const contact = contactResult[0]
        const servicesRequested = contact.services_requested || []
        const servicesProvided = contact.services_provided || []

        // Check if service is already provided
        const alreadyProvided = servicesProvided.some((service: any) => service.service === serviceName)

        if (alreadyProvided) {
          console.log(`Service ${serviceName} already provided for contact ${contactId}`)
          continue
        }

        // Add the service to provided services
        const newServiceProvided = {
          service: serviceName,
          provider: providerName,
          completedAt: new Date().toISOString(),
        }

        const updatedServicesProvided = [...servicesProvided, newServiceProvided]

        // Update the contact record
        await sql.query("UPDATE contacts SET services_provided = $1, updated_at = NOW() WHERE id = $2", [
          JSON.stringify(updatedServicesProvided),
          contactId,
        ])

        completedContacts.push({
          id: contactId,
          service: serviceName,
          provider: providerName,
        })
      } catch (error) {
        console.error(`Error processing contact ${contactId}:`, error)
      }
    }

    return NextResponse.json({
      message: `${serviceName} service completed for ${completedContacts.length} contact(s)`,
      completedContacts,
    })
  } catch (error) {
    console.error("Service completion failed:", error)
    return NextResponse.json(
      { error: `Service completion failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
