import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getTodayString } from "@/lib/date-utils"

export async function POST() {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    console.log("🚨 EMERGENCY FIX: Correcting all future dates...")

    // Get today's date in Chicago time (06/30/2025)
    const todayString = getTodayString()

    // First, check how many records have future dates
    const futureCount = await sql`
      SELECT COUNT(*) as count 
      FROM contacts 
      WHERE contact_date > (${todayString})::DATE
    `

    console.log(`Found ${futureCount[0].count} contacts with dates after ${todayString}`)

    let updatedCount = 0
    if (futureCount[0].count > 0) {
      // Update all future dates to random dates between 2021-01-01 and today
      console.log("Updating future dates to valid range...")

      const updated = await sql`
        UPDATE contacts 
        SET 
          contact_date = (
            DATE '2021-01-01' + 
            (RANDOM() * ((${todayString})::DATE - DATE '2021-01-01'))::INTEGER
          ),
          updated_at = NOW()
        WHERE contact_date > (${todayString})::DATE
        RETURNING id
      `

      updatedCount = updated.length
      console.log(`✅ Updated ${updatedCount} contacts with new valid dates`)
    }

    // Recalculate days_ago for ALL contacts based on Chicago today
    console.log("Recalculating days_ago for all contacts...")
    await sql`
      UPDATE contacts 
      SET 
        days_ago = ((${todayString})::DATE - contact_date)::INTEGER,
        updated_at = NOW()
    `

    // Verify the fix
    const verification = await sql`
      SELECT 
        MIN(contact_date) as earliest_date,
        MAX(contact_date) as latest_date,
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN contact_date > (${todayString})::DATE THEN 1 END) as future_dates_remaining
      FROM contacts
    `

    const result = verification[0]

    // Get year distribution
    const yearDistribution = await sql`
      SELECT 
        EXTRACT(YEAR FROM contact_date) as year,
        COUNT(*) as count
      FROM contacts
      GROUP BY EXTRACT(YEAR FROM contact_date)
      ORDER BY year
    `

    return NextResponse.json({
      message: "Emergency date fix completed successfully!",
      statistics: {
        futureRecordsFound: futureCount[0].count,
        recordsUpdated: updatedCount,
        earliestDate: result.earliest_date,
        latestDate: result.latest_date,
        totalContacts: result.total_contacts,
        futureDatesRemaining: result.future_dates_remaining,
        todayInChicago: todayString,
        yearDistribution: yearDistribution.map((row: any) => ({
          year: row.year,
          count: row.count,
        })),
      },
    })
  } catch (error) {
    console.error("Emergency fix failed:", error)
    return NextResponse.json(
      { error: `Emergency fix failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
