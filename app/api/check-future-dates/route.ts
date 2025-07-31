import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const result = await sql`
      SELECT 
        id,
        client_name,
        contact_date,
        provider_name,
        location
      FROM contacts
      WHERE contact_date > ${today}
      ORDER BY contact_date DESC
    `

    return NextResponse.json({
      hasFutureDates: result.length > 0,
      futureContacts: result,
      count: result.length,
    })
  } catch (error) {
    console.error("Future dates check error:", error)
    return NextResponse.json({ error: "Failed to check for future dates" }, { status: 500 })
  }
}
