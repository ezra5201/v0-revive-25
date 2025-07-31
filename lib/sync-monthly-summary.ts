import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Synchronizes monthly service summary data for a specific month and year
 * @param targetMonth - Month to sync (1-12), defaults to current month
 * @param targetYear - Year to sync (2020-2030), defaults to current year
 * @returns Promise with sync results including success status and record counts
 */
export async function syncMonthlyServiceSummary(
  targetMonth?: number,
  targetYear?: number,
): Promise<{
  success: boolean
  message: string
  recordsProcessed: number
  month: number
  year: number
  timestamp: string
}> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  // Default to current month/year if not provided
  const now = new Date()
  const month = targetMonth ?? now.getMonth() + 1
  const year = targetYear ?? now.getFullYear()

  console.log(`[${timestamp}] Starting sync for ${month}/${year}`)

  // Parameter validation
  if (month < 1 || month > 12) {
    const errorMsg = `Invalid month: ${month}. Must be between 1-12`
    console.error(`[${timestamp}] ${errorMsg}`)
    return {
      success: false,
      message: errorMsg,
      recordsProcessed: 0,
      month,
      year,
      timestamp,
    }
  }

  if (year < 2020 || year > 2030) {
    const errorMsg = `Invalid year: ${year}. Must be between 2020-2030`
    console.error(`[${timestamp}] ${errorMsg}`)
    return {
      success: false,
      message: errorMsg,
      recordsProcessed: 0,
      month,
      year,
      timestamp,
    }
  }

  try {
    console.log(`[${timestamp}] Validating database connection...`)

    // Test database connection
    await sql`SELECT 1`
    console.log(`[${timestamp}] Database connection successful`)

    // Service mapping - identical to Phase 1 script
    const serviceMapping = {
      Meals: "meals",
      Clothing: "clothing",
      Shower: "shower",
      Laundry: "laundry",
      Mail: "mail",
      Phone: "phone",
      Computer: "computer",
      "Case Management": "case_management",
      "Occupational Therapy": "occupational_therapy",
    }

    console.log(`[${timestamp}] Starting data aggregation for ${month}/${year}...`)

    // Delete existing records for the target month/year
    const deleteResult = await sql`
      DELETE FROM monthly_service_summary 
      WHERE month = ${month} AND year = ${year}
    `
    console.log(`[${timestamp}] Deleted ${deleteResult.length} existing records for ${month}/${year}`)

    let totalRecordsProcessed = 0

    // Process each service type
    for (const [displayName, columnName] of Object.entries(serviceMapping)) {
      console.log(`[${timestamp}] Processing ${displayName} (${columnName})...`)

      const result = await sql`
        INSERT INTO monthly_service_summary (month, year, service_type, total_count, unique_clients)
        SELECT 
          ${month} as month,
          ${year} as year,
          ${displayName} as service_type,
          COUNT(*) as total_count,
          COUNT(DISTINCT name) as unique_clients
        FROM contacts 
        WHERE EXTRACT(MONTH FROM date) = ${month}
          AND EXTRACT(YEAR FROM date) = ${year}
          AND ${sql(columnName)} = true
      `

      const recordsInserted = result.length
      totalRecordsProcessed += recordsInserted
      console.log(`[${timestamp}] Inserted ${recordsInserted} records for ${displayName}`)
    }

    const endTime = Date.now()
    const duration = endTime - startTime
    const successMsg = `Successfully synced ${totalRecordsProcessed} records for ${month}/${year} in ${duration}ms`

    console.log(`[${timestamp}] ${successMsg}`)

    return {
      success: true,
      message: successMsg,
      recordsProcessed: totalRecordsProcessed,
      month,
      year,
      timestamp,
    }
  } catch (error) {
    const errorMsg = `Sync failed for ${month}/${year}: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(`[${timestamp}] ${errorMsg}`, error)

    return {
      success: false,
      message: errorMsg,
      recordsProcessed: 0,
      month,
      year,
      timestamp,
    }
  }
}
