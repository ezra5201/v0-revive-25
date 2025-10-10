import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("[v0] ===== CONTACTS API GET - COMPLETELY REWRITTEN =====")

  if (!sql) {
    console.log("[v0] No SQL connection")
    return NextResponse.json({ contacts: [] })
  }

  try {
    console.log("[v0] About to query database...")

    const rows = await sql`
      SELECT id, contact_date, provider_name, client_name, category
        FROM contacts
       ORDER BY contact_date DESC
       LIMIT 100
    `

    console.log("[v0] Query successful, rows:", rows.length)

    return NextResponse.json({ contacts: rows })
  } catch (err: any) {
    console.error("[v0] Contacts GET failed:", err)
    return NextResponse.json(
      {
        contacts: [],
        error: "Failed to fetch contacts",
        message: err.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()

    const result = await sql`
      INSERT INTO contacts (
        contact_date, provider_name, client_name, category, food_accessed,
        services_requested, services_provided, comments
      )
      VALUES (
        ${body.contact_date}, ${body.provider_name}, ${body.client_name}, 
        ${body.category}, ${body.food_accessed || false},
        ${JSON.stringify(body.services_requested || [])}, 
        ${JSON.stringify(body.services_provided || [])}, 
        ${body.comments || ""}
      )
      RETURNING *
    `

    return NextResponse.json({ contact: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Failed to create contact:", error)
    return NextResponse.json(
      { error: `Failed to create contact: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
