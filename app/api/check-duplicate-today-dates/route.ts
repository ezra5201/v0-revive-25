import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const result = await sql`
      SELECT 
        client_name,
        COUNT(*) as duplicate_count
      FROM contacts
      WHERE contact_date = ${today}
      GROUP BY client_name
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
    `

    return NextResponse.json({
      hasDuplicates: result.length > 0,
      duplicates: result,
      totalDuplicateEntries: result.reduce((sum: number, item: any) => sum + Number.parseInt(item.duplicate_count), 0),
    })
  } catch (error) {
    console.error("Duplicate check error:", error)
    return NextResponse.json({ error: "Failed to check for duplicates" }, { status: 500 })
  }
}
