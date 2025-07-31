import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Find duplicates for today
    const duplicates = await sql`
      SELECT 
        client_name,
        MIN(id) as keep_id,
        array_agg(id ORDER BY id) as all_ids
      FROM contacts
      WHERE contact_date = CURRENT_DATE
      GROUP BY client_name
      HAVING COUNT(*) > 1
    `

    let deletedCount = 0

    // Delete duplicates, keeping only the first one
    for (const duplicate of duplicates) {
      const idsToDelete = duplicate.all_ids.slice(1) // Remove first ID (keep it)

      if (idsToDelete.length > 0) {
        await sql`
          DELETE FROM contacts
          WHERE id = ANY(${idsToDelete})
        `
        deletedCount += idsToDelete.length
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      duplicateGroups: duplicates.length,
    })
  } catch (error) {
    console.error("Error fixing duplicate today dates:", error)
    return NextResponse.json({ error: "Failed to fix duplicate today dates" }, { status: 500 })
  }
}
