import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    console.log("🔧 Fixing duplicate today dates...")

    // First, check current state
    const currentState = await sql`
      SELECT COUNT(*) as total_today_records,
             COUNT(DISTINCT client_name) as unique_clients_today
      FROM contacts 
      WHERE contact_date = CURRENT_DATE
    `

    console.log(`Current state:`)
    console.log(`  - Total records for today: ${currentState[0].total_today_records}`)
    console.log(`  - Unique clients for today: ${currentState[0].unique_clients_today}`)

    if (currentState[0].unique_clients_today <= 40) {
      return NextResponse.json({
        message: "Already have 40 or fewer unique clients for today. No fix needed.",
        statistics: {
          totalTodayRecords: currentState[0].total_today_records,
          uniqueClientsToday: currentState[0].unique_clients_today,
          recordsMoved: 0,
        },
      })
    }

    // Keep only the most recent record for each client on today's date
    console.log("Keeping only the most recent record for each client on today's date...")
    const result = await sql`
      DELETE FROM contacts
      WHERE id NOT IN (
        SELECT DISTINCT ON (client_name) id
        FROM contacts
        WHERE contact_date = CURRENT_DATE
        ORDER BY client_name, created_at DESC
      )
      AND contact_date = CURRENT_DATE
    `

    console.log(`✅ Deleted ${result.length} duplicate records for today`)

    // Verify the fix
    const verification = await sql`
      SELECT 
        contact_date,
        COUNT(*) as record_count,
        COUNT(DISTINCT client_name) as unique_clients
      FROM contacts 
      WHERE contact_date = CURRENT_DATE
      GROUP BY contact_date
    `

    // Show distribution by year
    const yearDistribution = await sql`
      SELECT 
        EXTRACT(YEAR FROM contact_date) as year,
        COUNT(*) as count,
        COUNT(DISTINCT client_name) as unique_clients
      FROM contacts
      GROUP BY EXTRACT(YEAR FROM contact_date)
      ORDER BY year DESC
    `

    return NextResponse.json({
      message: "Successfully fixed duplicate today dates!",
      statistics: {
        totalTodayRecords: verification.length > 0 ? verification[0].record_count : 0,
        uniqueClientsToday: verification.length > 0 ? verification[0].unique_clients : 0,
        recordsDeleted: result.length,
        yearDistribution: yearDistribution.map((row: any) => ({
          year: row.year,
          count: row.count,
          uniqueClients: row.unique_clients,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to fix duplicate today dates:", error)
    return NextResponse.json({ success: false, error: "Failed to fix duplicates" }, { status: 500 })
  }
}
