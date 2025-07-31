import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { contactIds } = await request.json()

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 })
    }

    // Update services_provided to match services_requested for selected contacts
    const result = await sql`
      UPDATE contacts 
      SET services_provided = services_requested
      WHERE id = ANY(${contactIds})
      AND (services_provided IS NULL OR services_provided = '')
    `

    return NextResponse.json({
      success: true,
      message: `Marked services as completed for ${contactIds.length} contact(s)`,
    })
  } catch (error) {
    console.error("Error completing services:", error)
    return NextResponse.json({ error: "Failed to complete services" }, { status: 500 })
  }
}
