import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Fix any contacts with invalid dates (future dates set to today)
    const result = await sql`
      UPDATE contacts 
      SET contact_date = CURRENT_DATE
      WHERE contact_date > CURRENT_DATE
      RETURNING id, client_id, contact_date
    `

    return NextResponse.json({
      success: true,
      message: `Fixed ${result.length} contacts with future dates`,
      fixedContacts: result,
    })
  } catch (error) {
    console.error("Emergency fix dates error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix dates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
