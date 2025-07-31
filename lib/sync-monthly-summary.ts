import { neon } from "@neondatabase/serverless"

/**
 * Synchronizes monthly service summary data for a specific month and year
 * @param targetMonth - Month to sync (1-12), defaults to current month
 * @param targetYear - Year to sync (1900-2099), defaults to current year
 * @returns Promise with sync results
 */
export async function syncMonthlyServiceSummary(
  targetMonth?: number,
  targetYear?: number,
): Promise<{ success: boolean; message: string; recordsProcessed: number }> {
  const sql = neon(process.env.DATABASE_URL!)

  // Default to current month/year if not provided
  const now = new Date()
  const month = targetMonth ?? now.getMonth() + 1
  const year = targetYear ?? now.getFullYear()

  // Validate parameters
  if (month < 1 || month > 12) {
    return {
      success: false,
      message: `Invalid month: ${month}. Must be between 1 and 12.`,
      recordsProcessed: 0,
    }
  }

  if (year < 1900 || year > 2099) {
    return {
      success: false,
      message: `Invalid year: ${year}. Must be between 1900 and 2099.`,
      recordsProcessed: 0,
    }
  }

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Starting sync for ${year}-${month.toString().padStart(2, "0")}`)

  try {
    // Create monthly_service_summary table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_service_summary (
        id SERIAL PRIMARY KEY,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        total_contacts INTEGER NOT NULL DEFAULT 0,
        unique_clients INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(month, year, service_type)
      )
    `

    // Delete existing data for this month/year
    await sql`
      DELETE FROM monthly_service_summary 
      WHERE month = ${month} AND year = ${year}
    `

    // Get aggregated data for the target month/year
    const results = await sql`
      SELECT 
        service_type,
        COUNT(*) as total_contacts,
        COUNT(DISTINCT client_name) as unique_clients
      FROM contacts 
      WHERE EXTRACT(MONTH FROM contact_date) = ${month}
        AND EXTRACT(YEAR FROM contact_date) = ${year}
      GROUP BY service_type
      ORDER BY service_type
    `

    let recordsProcessed = 0

    // Insert aggregated data
    for (const row of results) {
      await sql`
        INSERT INTO monthly_service_summary (month, year, service_type, total_contacts, unique_clients)
        VALUES (${month}, ${year}, ${row.service_type}, ${row.total_contacts}, ${row.unique_clients})
      `
      recordsProcessed++
    }

    const endTimestamp = new Date().toISOString()
    console.log(
      `[${endTimestamp}] Completed sync for ${year}-${month.toString().padStart(2, "0")}: ${recordsProcessed} records processed`,
    )

    return {
      success: true,
      message: `Successfully synced ${year}-${month.toString().padStart(2, "0")}: ${recordsProcessed} service types processed`,
      recordsProcessed,
    }
  } catch (error) {
    const errorTimestamp = new Date().toISOString()
    console.error(`[${errorTimestamp}] Error syncing ${year}-${month.toString().padStart(2, "0")}:`, error)

    return {
      success: false,
      message: `Failed to sync ${year}-${month.toString().padStart(2, "0")}: ${error instanceof Error ? error.message : "Unknown error"}`,
      recordsProcessed: 0,
    }
  }
}
