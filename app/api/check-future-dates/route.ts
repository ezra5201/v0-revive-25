import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const futureDates = await sql`
      SELECT 
        id,
        client_name,
        contact_date
      FROM contacts
      WHERE contact_date > CURRENT_DATE
      ORDER BY contact_date
    `

    return NextResponse.json({
      hasFutureDates: futureDates.length > 0,
      futureDates,
    })
  } catch (error) {
    console.error("Check future dates error:", error)
    return NextResponse.json(
      {
        hasFutureDates: false,
        futureDates: [],
      },
      { status: 500 },
    )
  }
}
