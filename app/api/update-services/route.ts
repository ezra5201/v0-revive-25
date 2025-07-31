import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { syncServicesToIntegerColumns, buildIntegerColumnsSql } from "@/lib/service-sync"

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

    // Sync JSONB services to integer columns
    const integerColumnUpdates = syncServicesToIntegerColumns(currentServicesRequested, servicesProvided)
    const integerColumnsSql = buildIntegerColumnsSql(integerColumnUpdates)

    // Update the contact record with both JSONB and integer columns
    const updateSql = `
      UPDATE contacts 
      SET 
        services_provided = $1,
        updated_at = NOW(),
        ${integerColumnsSql}
      WHERE id = $2
      RETURNING id, client_name, contact_date, services_requested, services_provided
    `

    const result = await sql.unsafe(updateSql, [JSON.stringify(servicesProvided), contactId])

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
    console.log("Integer columns updated:", integerColumnUpdates)

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
      integerColumnsUpdated: integerColumnUpdates,
    })
  } catch (error) {
    console.error("Services update failed:", error)
    return NextResponse.json(
      { error: `Services update failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
