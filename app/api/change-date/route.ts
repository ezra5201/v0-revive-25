import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { contactId, newDate } = await request.json()

    if (!contactId || !newDate) {
      return NextResponse.json({ error: "Contact ID and new date are required" }, { status: 400 })
    }

    // Update the contact date
    await sql`
      UPDATE contacts 
      SET contact_date = ${newDate}
      WHERE id = ${contactId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contact date:", error)
    return NextResponse.json({ error: "Failed to update contact date" }, { status: 500 })
  }
}
