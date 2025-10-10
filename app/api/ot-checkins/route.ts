import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"
import { CreateCheckinSchema, validateRequest } from "@/lib/validations"

export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()

    const validation = validateRequest(CreateCheckinSchema, body)

    if (!validation.success) {
      return NextResponse.json(validation.formattedError, { status: 400 })
    }

    const validatedData = validation.data

    const finalContactId = validatedData.contact_id && validatedData.contact_id > 0 ? validatedData.contact_id : null

    const result = await sql`
      INSERT INTO ot_checkins (contact_id, client_name, client_uuid, provider_name, notes, status)
      VALUES (${finalContactId}, ${validatedData.client_name}, ${validatedData.client_uuid}, 
              ${validatedData.provider_name}, ${validatedData.notes}, 'Draft')
      RETURNING id, contact_id, client_name, client_uuid, provider_name, notes, status, created_at, updated_at
    `

    const newCheckin = result[0]

    await auditLog({
      action: "CREATE",
      tableName: "ot_checkins",
      recordId: newCheckin.id.toString(),
      clientName: validatedData.client_name,
      userEmail: getUserFromRequest(request),
      ipAddress: getIpFromRequest(request),
      changes: {
        contact_id: finalContactId,
        provider_name: validatedData.provider_name,
        status: "Draft",
        notes: validatedData.notes,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newCheckin.id,
          contact_id: newCheckin.contact_id,
          client_name: newCheckin.client_name,
          client_uuid: newCheckin.client_uuid,
          provider_name: newCheckin.provider_name,
          notes: newCheckin.notes,
          status: newCheckin.status,
          created_at: newCheckin.created_at,
          updated_at: newCheckin.updated_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create OT check-in:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to create OT check-in",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
