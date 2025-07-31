import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { contactId, newDate } = await request.json()

    if (!contactId || !newDate) {
      return NextResponse.json({ success: false, error: "Contact ID and new date are required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`
      UPDATE contacts 
      SET contact_date = ${newDate}
      WHERE id = ${contactId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change date error:", error)
    return NextResponse.json({ success: false, error: "Failed to change contact date" }, { status: 500 })
  }
}
