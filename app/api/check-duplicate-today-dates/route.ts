import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const duplicates = await sql`
      SELECT 
        client_name,
        contact_date,
        COUNT(*) as duplicate_count
      FROM contacts
      WHERE contact_date = CURRENT_DATE
      GROUP BY client_name, contact_date
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `

    return NextResponse.json({
      duplicates,
      totalDuplicates: duplicates.length,
    })
  } catch (error) {
    console.error("Error checking duplicate today dates:", error)
    return NextResponse.json({ error: "Failed to check duplicate today dates" }, { status: 500 })
  }
}
