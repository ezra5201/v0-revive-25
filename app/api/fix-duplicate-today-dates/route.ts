import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Find and remove duplicate contacts for today
    const duplicates = await sql`
      DELETE FROM contacts 
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY client_id, contact_date 
                   ORDER BY id DESC
                 ) as rn
          FROM contacts 
          WHERE contact_date = CURRENT_DATE
        ) t 
        WHERE t.rn > 1
      )
      RETURNING id, client_id
    `

    return NextResponse.json({
      success: true,
      message: `Removed ${duplicates.length} duplicate contacts for today`,
      removedContacts: duplicates,
    })
  } catch (error) {
    console.error("Fix duplicate today dates error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix duplicate dates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
