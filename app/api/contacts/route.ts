import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { CreateContactSchema, validateRequest } from "@/lib/validations"

export async function GET(request: NextRequest) {
  console.log("[v0] ===== CONTACTS API GET HANDLER STARTED =====")

  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get("tab") || "all"

    console.log("[v0] Handler is working! Tab:", tab)

    // Return empty array for now to test if the issue is with the SQL queries
    return NextResponse.json({
      contacts: [],
      debug: "Handler is working, returning empty array for testing",
    })
  } catch (error) {
    console.error("[v0] Error in simplified handler:", error)
    return NextResponse.json({ error: "Handler error", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()

    const validation = validateRequest(CreateContactSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    // Insert the new contact using validated data
    const result = await sql`
      INSERT INTO contacts (
        contact_date, provider_name, client_name, category, food_accessed,
        services_requested, services_provided, comments
      )
      VALUES (
        ${validatedData.contact_date}, ${validatedData.provider_name}, ${validatedData.client_name}, 
        ${validatedData.category}, ${validatedData.food_accessed},
        ${JSON.stringify(validatedData.services_requested)}, ${JSON.stringify(validatedData.services_provided)}, 
        ${validatedData.comments}
      )
      RETURNING *
    `

    const newContact = result[0]

    await auditLog({
      action: "CREATE",
      tableName: "contacts",
      recordId: newContact.id.toString(),
      clientName: validatedData.client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        contact_date: validatedData.contact_date,
        provider_name: validatedData.provider_name,
        category: validatedData.category,
        food_accessed: validatedData.food_accessed,
        services_requested: validatedData.services_requested,
        services_provided: validatedData.services_provided,
      },
    })

    return NextResponse.json({ contact: newContact }, { status: 201 })
  } catch (error) {
    console.error("Failed to create contact:", error)
    return NextResponse.json(
      { error: `Failed to create contact: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
