import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { syncServicesToIntegerColumns } from "@/lib/service-sync"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"

// Helper function to safely parse JSON
function safeJson(value: unknown, fallback: any = []) {
  if (Array.isArray(value) || typeof value === "object") return value ?? fallback
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return fallback
}

// Ensures the services_update_log table exists
async function ensureServicesUpdateLogTable() {
  if (!sql) return

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS services_update_log (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        updated_by VARCHAR(255) NOT NULL,
        services_added JSONB DEFAULT '[]',
        services_removed JSONB DEFAULT '[]',
        update_type VARCHAR(50) DEFAULT 'services_update',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_services_update_log_contact_id ON services_update_log(contact_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_services_update_log_updated_at ON services_update_log(updated_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_services_update_log_updated_by ON services_update_log(updated_by)`
  } catch (error) {
    console.log("Services update log table may already exist:", error)
  }
}

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    // Ensure the services_update_log table exists
    await ensureServicesUpdateLogTable()

    const body = await request.json()
    const { contactId, servicesProvided = [], updatedBy } = body

    console.log("Services update request:", { contactId, servicesProvided, updatedBy })

    // Validate required fields
    if (!contactId || !updatedBy) {
      return NextResponse.json({ error: "Contact ID and updater name are required" }, { status: 400 })
    }

    // Get current contact data
    const currentContact = await sql`
      SELECT id, services_requested, services_provided, client_name, contact_date
      FROM contacts 
      WHERE id = ${contactId}
    `

    if (currentContact.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const contact = currentContact[0]
    const currentServicesRequested = safeJson(contact.services_requested, [])
    const currentServicesProvided = safeJson(contact.services_provided, [])

    // Calculate what services are being added and removed
    const currentServiceNames = currentServicesProvided.map((s: any) => s.service)
    const newServiceNames = servicesProvided.map((s: any) => s.service)

    const servicesAdded = servicesProvided.filter((s: any) => !currentServiceNames.includes(s.service))
    const servicesRemoved = currentServicesProvided.filter((s: any) => !newServiceNames.includes(s.service))

    console.log("Services comparison:", {
      current: currentServiceNames,
      new: newServiceNames,
      added: servicesAdded.map((s: any) => s.service),
      removed: servicesRemoved.map((s: any) => s.service),
    })

    // Update the contact record
    const result = await sql`
      UPDATE contacts 
      SET 
        services_provided = ${JSON.stringify(servicesProvided)},
        updated_at = NOW()
      WHERE id = ${contactId}
      RETURNING id, client_name, contact_date, services_requested, services_provided
    `

    await auditLog({
      action: "UPDATE",
      tableName: "contacts",
      recordId: contactId.toString(),
      clientName: contact.client_name,
      userEmail: getUserFromRequest(request) || updatedBy,
      ipAddress: getIpFromRequest(request),
      changes: {
        services_added: servicesAdded,
        services_removed: servicesRemoved,
        services_provided_before: currentServicesProvided,
        services_provided_after: servicesProvided,
      },
    })

    // Sync JSONB services to integer columns
    const integerColumnUpdates = syncServicesToIntegerColumns(currentServicesRequested, servicesProvided)

    // Update the integer columns
    await sql`
      UPDATE contacts 
      SET 
        case_management_requested = ${integerColumnUpdates.case_management_requested},
        case_management_provided = ${integerColumnUpdates.case_management_provided},
        occupational_therapy_requested = ${integerColumnUpdates.occupational_therapy_requested},
        occupational_therapy_provided = ${integerColumnUpdates.occupational_therapy_provided},
        food_requested = ${integerColumnUpdates.food_requested},
        food_provided = ${integerColumnUpdates.food_provided},
        healthcare_requested = ${integerColumnUpdates.healthcare_requested},
        healthcare_provided = ${integerColumnUpdates.healthcare_provided},
        housing_requested = ${integerColumnUpdates.housing_requested},
        housing_provided = ${integerColumnUpdates.housing_provided},
        employment_requested = ${integerColumnUpdates.employment_requested},
        employment_provided = ${integerColumnUpdates.employment_provided},
        benefits_requested = ${integerColumnUpdates.benefits_requested},
        benefits_provided = ${integerColumnUpdates.benefits_provided},
        legal_requested = ${integerColumnUpdates.legal_requested},
        legal_provided = ${integerColumnUpdates.legal_provided},
        transportation_requested = ${integerColumnUpdates.transportation_requested},
        transportation_provided = ${integerColumnUpdates.transportation_provided},
        childcare_requested = ${integerColumnUpdates.childcare_requested},
        childcare_provided = ${integerColumnUpdates.childcare_provided},
        mental_health_requested = ${integerColumnUpdates.mental_health_requested},
        mental_health_provided = ${integerColumnUpdates.mental_health_provided},
        substance_abuse_requested = ${integerColumnUpdates.substance_abuse_requested},
        substance_abuse_provided = ${integerColumnUpdates.substance_abuse_provided},
        education_requested = ${integerColumnUpdates.education_requested},
        education_provided = ${integerColumnUpdates.education_provided}
      WHERE id = ${contactId}
    `

    console.log("Integer columns synced successfully")

    // Log the services update
    await sql`
      INSERT INTO services_update_log (
        contact_id, updated_by, services_added, services_removed, 
        update_type, updated_at
      )
      VALUES (
        ${contactId}, ${updatedBy}, ${JSON.stringify(servicesAdded)}, 
        ${JSON.stringify(servicesRemoved)}, 'services_update', NOW()
      )
    `

    console.log("Services updated successfully:", result[0])

    return NextResponse.json({
      message: "Services updated successfully",
      contact: {
        id: result[0].id,
        clientName: result[0].client_name,
        contactDate: result[0].contact_date,
        servicesRequested: safeJson(result[0].services_requested, []),
        servicesProvided: safeJson(result[0].services_provided, []),
      },
      changes: {
        added: servicesAdded,
        removed: servicesRemoved,
      },
    })
  } catch (error) {
    console.error("Services update failed:", error)
    return NextResponse.json(
      { error: `Services update failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
