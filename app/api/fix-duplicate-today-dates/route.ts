import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    console.log("🔧 Fixing duplicate today dates (06/30/2025)...")

    // First, check current state
    const currentState = await sql`
      SELECT COUNT(*) as total_today_records,
             COUNT(DISTINCT client_name) as unique_clients_today
      FROM contacts 
      WHERE contact_date = '2025-06-30'
    `

    console.log(`Current state:`)
    console.log(`  - Total records for 06/30/2025: ${currentState[0].total_today_records}`)
    console.log(`  - Unique clients for 06/30/2025: ${currentState[0].unique_clients_today}`)

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

    // Get the first 40 unique clients for today (by alphabetical order and creation time)
    console.log("Selecting first 40 unique clients to keep for today...")
    const keepToday = await sql`
      SELECT DISTINCT ON (client_name) id, client_name
      FROM contacts 
      WHERE contact_date = '2025-06-30'
      ORDER BY client_name, created_at ASC
      LIMIT 40
    `

    console.log(`Selected ${keepToday.length} unique clients to keep for today`)

    // Get IDs to keep
    const keepIds = keepToday.map((client: any) => client.id)

    // Update all other records from 06/30/2025 to random dates in 2022-2024
    console.log("Moving other 06/30/2025 records to random dates in 2022-2024...")

    const movedRecords = await sql`
      UPDATE contacts 
      SET 
        contact_date = (
          DATE '2022-01-01' + 
          (RANDOM() * (DATE '2024-12-31' - DATE '2022-01-01'))::INTEGER
        ),
        updated_at = NOW()
      WHERE contact_date = '2025-06-30' 
        AND id != ALL(${keepIds})
      RETURNING id, client_name, contact_date
    `

    console.log(`✅ Moved ${movedRecords.length} records to random dates in 2022-2024`)

    // Recalculate days_ago for all contacts
    console.log("Recalculating days_ago for all contacts...")
    await sql`
      UPDATE contacts 
      SET 
        days_ago = (DATE '2025-06-30' - contact_date)::INTEGER,
        updated_at = NOW()
    `

    // Verify the fix
    const verification = await sql`
      SELECT 
        contact_date,
        COUNT(*) as record_count,
        COUNT(DISTINCT client_name) as unique_clients
      FROM contacts 
      WHERE contact_date = '2025-06-30'
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
        recordsMoved: movedRecords.length,
        keptClients: keepToday.map((client: any) => client.client_name),
        yearDistribution: yearDistribution.map((row: any) => ({
          year: row.year,
          count: row.count,
          uniqueClients: row.unique_clients,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to fix duplicate today dates:", error)
    return NextResponse.json(
      { error: `Failed to fix duplicate today dates: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
