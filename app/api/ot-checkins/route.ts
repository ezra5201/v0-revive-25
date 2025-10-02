import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

interface CreateOTCheckinRequest {
  contact_id?: number | null
  client_name: string
  client_uuid?: string
  provider_name: string
  notes?: string
}

interface OTCheckinResponse {
  id: number
  contact_id: number | null
  client_name: string
  client_uuid: string | null
  provider_name: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body: CreateOTCheckinRequest = await request.json()
    const { contact_id, client_name, client_uuid, provider_name, notes } = body

    if (contact_id !== undefined && contact_id !== null && typeof contact_id !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Contact ID must be a number",
            details: { field: "contact_id", value: contact_id },
          },
        },
        { status: 400 },
      )
    }

    if (!client_name || typeof client_name !== "string" || client_name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Client name is required",
            details: { field: "client_name", value: client_name },
          },
        },
        { status: 400 },
      )
    }

    if (!provider_name || typeof provider_name !== "string" || provider_name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Provider name is required",
            details: { field: "provider_name", value: provider_name },
          },
        },
        { status: 400 },
      )
    }

    const finalContactId = contact_id || 0

    const result = await sql`
      INSERT INTO ot_checkins (contact_id, client_name, client_uuid, provider_name, notes, status)
      VALUES (${finalContactId}, ${client_name.trim()}, ${client_uuid || null}, ${provider_name.trim()}, ${notes || null}, 'Draft')
      RETURNING id, contact_id, client_name, client_uuid, provider_name, notes, status, created_at, updated_at
    `

    const newCheckin = result[0]

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
