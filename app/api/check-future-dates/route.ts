import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Find contacts with future dates
    const futureDates = await sql`
      SELECT 
        id,
        client_id,
        contact_date,
        contact_type
      FROM contacts 
      WHERE contact_date > CURRENT_DATE
      ORDER BY contact_date ASC
    `

    return NextResponse.json({
      success: true,
      futureDates,
      hasFutureDates: futureDates.length > 0,
      count: futureDates.length,
    })
  } catch (error) {
    console.error("Check future dates error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check future dates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
