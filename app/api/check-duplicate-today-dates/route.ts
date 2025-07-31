import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Find contacts with today's date that might be duplicates
    const duplicates = await sql`
      SELECT 
        client_id,
        contact_date,
        COUNT(*) as duplicate_count
      FROM contacts 
      WHERE contact_date = CURRENT_DATE
      GROUP BY client_id, contact_date
      HAVING COUNT(*) > 1
    `

    return NextResponse.json({
      success: true,
      duplicates,
      hasDuplicates: duplicates.length > 0,
    })
  } catch (error) {
    console.error("Check duplicate today dates error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check duplicate today dates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
