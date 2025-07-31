import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const duplicates = await sql`
      SELECT 
        client_name,
        COUNT(*) as duplicate_count
      FROM contacts
      WHERE contact_date = CURRENT_DATE
      GROUP BY client_name
      HAVING COUNT(*) > 1
    `

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
    })
  } catch (error) {
    console.error("Check duplicate today dates error:", error)
    return NextResponse.json(
      {
        hasDuplicates: false,
        duplicates: [],
      },
      { status: 500 },
    )
  }
}
