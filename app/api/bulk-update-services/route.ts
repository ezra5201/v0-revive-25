import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactIds, servicesProvided, updatedBy } = body

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ success: false, error: "Contact IDs are required" }, { status: 400 })
    }

    if (!servicesProvided || !Array.isArray(servicesProvided)) {
      return NextResponse.json({ success: false, error: "Services provided data is required" }, { status: 400 })
    }

    // Update services for all selected contacts
    const updatePromises = contactIds.map(async (contactId) => {
      // First, get the current contact data
      const contactResult = await sql`
        SELECT services_provided
        FROM contacts
        WHERE id = ${contactId}
      `

      if (contactResult.length === 0) {
        throw new Error(`Contact with ID ${contactId} not found`)
      }

      const currentServicesProvided = contactResult[0].services_provided || []

      // Merge new services with existing ones
      const serviceMap = new Map()

      // Add existing services
      currentServicesProvided.forEach((service: any) => {
        serviceMap.set(service.service, service)
      })

      // Add/update with new services
      servicesProvided.forEach((service: any) => {
        serviceMap.set(service.service, service)
      })

      const updatedServicesProvided = Array.from(serviceMap.values())

      // Update the contact
      await sql`
        UPDATE contacts
        SET 
          services_provided = ${JSON.stringify(updatedServicesProvided)},
          updated_at = NOW()
        WHERE id = ${contactId}
      `

      return contactId
    })

    const updatedContactIds = await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `Successfully updated services for ${updatedContactIds.length} contacts`,
      updatedContactIds,
    })
  } catch (error) {
    console.error("[v0] Bulk update services error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update services",
      },
      { status: 500 },
    )
  }
}
