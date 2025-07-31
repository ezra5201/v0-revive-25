import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const futureDates = await sql`
      SELECT 
        id,
        name,
        contact_date,
        created_at
      FROM contacts 
      WHERE contact_date > CURRENT_DATE
      ORDER BY contact_date DESC
    `

    return NextResponse.json({
      success: true,
      futureDates,
      hasFutureDates: futureDates.length > 0,
    })
  } catch (error) {
    console.error("Check future dates error:", error)
    return NextResponse.json({ success: false, error: "Failed to check future dates" }, { status: 500 })
  }
}
