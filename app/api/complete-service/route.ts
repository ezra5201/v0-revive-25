import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { contactId, serviceType } = await request.json()

    if (!contactId || !serviceType) {
      return NextResponse.json({ success: false, error: "Contact ID and service type are required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Mark service as completed (this would depend on your service tracking system)
    // For now, we'll just add a note to the contact
    await sql`
      UPDATE contacts 
      SET notes = COALESCE(notes, '') || ' [' || ${serviceType} || ' completed]'
      WHERE id = ${contactId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete service error:", error)
    return NextResponse.json({ success: false, error: "Failed to complete service" }, { status: 500 })
  }
}
