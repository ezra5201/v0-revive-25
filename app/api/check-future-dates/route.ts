import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const futureDates = await sql`
      SELECT 
        id,
        client_name,
        contact_date,
        provider_name
      FROM contacts
      WHERE contact_date > CURRENT_DATE
      ORDER BY contact_date DESC
    `

    return NextResponse.json({
      futureDates,
      count: futureDates.length,
    })
  } catch (error) {
    console.error("Error checking future dates:", error)
    return NextResponse.json({ error: "Failed to check future dates" }, { status: 500 })
  }
}
