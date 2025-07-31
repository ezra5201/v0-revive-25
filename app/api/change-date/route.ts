import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { contactId, newDate } = await request.json()

    if (!contactId || !newDate) {
      return NextResponse.json({ success: false, error: "Contact ID and new date are required" }, { status: 400 })
    }

    // Update the contact date
    const result = await sql`
      UPDATE contacts 
      SET contact_date = ${newDate}
      WHERE id = ${contactId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      contact: result[0],
    })
  } catch (error) {
    console.error("Change date error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to change contact date",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
