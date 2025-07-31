import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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
  const now = new Date()
  const month = targetMonth ?? now.getMonth() + 1
  const year = targetYear ?? now.getFullYear()

  // Parameter validation
  if (month < 1 || month > 12) {
    return {
      success: false,
      message: "Invalid month. Must be between 1 and 12.",
      recordsProcessed: 0,
    }
  }

  if (year < 1900 || year > 2099) {
    return {
      success: false,
      message: "Invalid year. Must be between 1900 and 2099.",
      recordsProcessed: 0,
    }
  }

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Starting sync for ${year}-${month.toString().padStart(2, "0")}`)

  try {
    // First, delete existing records for this month/year
    const deleteResult = await sql`
      DELETE FROM monthly_service_summary 
      WHERE month = ${month} AND year = ${year}
    `

    console.log(
      `[${timestamp}] Deleted ${deleteResult.length} existing records for ${year}-${month.toString().padStart(2, "0")}`,
    )

    // Get the date range for the target month
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
    const endDate = new Date(year, month, 0).toISOString().split("T")[0] // Last day of month

    // Aggregate and insert new data
    const insertResult = await sql`
      INSERT INTO monthly_service_summary (
        client_name, 
        provider_name, 
        service_type, 
        month, 
        year, 
        total_contacts, 
        completed_services, 
        pending_services, 
        last_contact_date,
        created_at,
        updated_at
      )
      SELECT 
        c.client_name,
        c.provider_name,
        c.service_type,
        ${month} as month,
        ${year} as year,
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN c.service_completed = true THEN 1 END) as completed_services,
        COUNT(CASE WHEN c.service_completed = false THEN 1 END) as pending_services,
        MAX(c.contact_date) as last_contact_date,
        NOW() as created_at,
        NOW() as updated_at
      FROM contacts c
      WHERE c.contact_date >= ${startDate}
        AND c.contact_date <= ${endDate}
      GROUP BY c.client_name, c.provider_name, c.service_type
      ORDER BY c.client_name, c.provider_name, c.service_type
    `

    const recordsProcessed = insertResult.length
    const successMessage = `Successfully synced ${recordsProcessed} records for ${year}-${month.toString().padStart(2, "0")}`

    console.log(`[${timestamp}] ${successMessage}`)

    return {
      success: true,
      message: successMessage,
      recordsProcessed,
    }
  } catch (error) {
    const errorMessage = `Failed to sync ${year}-${month.toString().padStart(2, "0")}: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(`[${timestamp}] ${errorMessage}`)

    return {
      success: false,
      message: errorMessage,
      recordsProcessed: 0,
    }
  }
}
