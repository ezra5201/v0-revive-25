import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Simple table structure for prototype
    const result = await sql`
      INSERT INTO cm_checkings (
        client_name, cm_provider_name, followup_date, meeting_type, 
        current_status, contact_summary, client_tasks, cm_tasks, 
        form_data, status, created_at
      ) VALUES (
        ${data.client_name}, ${data.cm_provider_name}, ${data.followup_date}, 
        ${data.meeting_type}, ${data.current_status}, ${data.contact_summary},
        ${data.client_tasks}, ${data.cm_tasks}, ${JSON.stringify(data)}, 
        ${data.status || "draft"}, CURRENT_TIMESTAMP
      )
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Error creating CM checking:", error)
    return NextResponse.json({ error: "Failed to create CM checking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientName = searchParams.get("client_name")

    if (!clientName) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    const checkings = await sql`
      SELECT id, followup_date, cm_provider_name, status, current_status, created_at
      FROM cm_checkings 
      WHERE client_name = ${clientName}
      ORDER BY followup_date DESC, created_at DESC
    `

    return NextResponse.json(checkings)
  } catch (error) {
    console.error("Error fetching CM checkings:", error)
    return NextResponse.json({ error: "Failed to fetch CM checkings" }, { status: 500 })
  }
}
