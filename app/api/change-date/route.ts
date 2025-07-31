import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { contactIds, newDate } = await request.json()

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 })
    }

    if (!newDate) {
      return NextResponse.json({ error: "New date is required" }, { status: 400 })
    }

    // Update the contact dates
    const result = await sql`
      UPDATE contacts 
      SET contact_date = ${newDate}
      WHERE id = ANY(${contactIds})
    `

    return NextResponse.json({
      success: true,
      message: `Updated ${contactIds.length} contact(s)`,
    })
  } catch (error) {
    console.error("Error changing contact dates:", error)
    return NextResponse.json({ error: "Failed to change contact dates" }, { status: 500 })
  }
}
