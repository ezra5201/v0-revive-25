import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get duplicates for today
    const duplicates = await sql`
      SELECT 
        name,
        MIN(id) as keep_id,
        ARRAY_AGG(id ORDER BY created_at) as all_ids
      FROM contacts 
      WHERE contact_date = CURRENT_DATE
      GROUP BY name
      HAVING COUNT(*) > 1
    `

    let deletedCount = 0

    for (const duplicate of duplicates) {
      const idsToDelete = duplicate.all_ids.filter((id: number) => id !== duplicate.keep_id)

      if (idsToDelete.length > 0) {
        await sql`DELETE FROM contacts WHERE id = ANY(${idsToDelete})`
        deletedCount += idsToDelete.length
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      duplicateGroups: duplicates.length,
    })
  } catch (error) {
    console.error("Fix duplicate today dates error:", error)
    return NextResponse.json({ success: false, error: "Failed to fix duplicate dates" }, { status: 500 })
  }
}
