import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const duplicates = await sql`
      SELECT 
        name,
        contact_date,
        COUNT(*) as duplicate_count
      FROM contacts 
      WHERE contact_date = CURRENT_DATE
      GROUP BY name, contact_date
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC, name
    `

    return NextResponse.json({
      success: true,
      duplicates,
      hasDuplicates: duplicates.length > 0,
    })
  } catch (error) {
    console.error("Check duplicate today dates error:", error)
    return NextResponse.json({ success: false, error: "Failed to check duplicate today dates" }, { status: 500 })
  }
}
