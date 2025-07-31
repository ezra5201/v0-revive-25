import { neon } from "@neondatabase/serverless"

export async function syncMonthlyServiceSummary(targetMonth?: number, targetYear?: number) {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // If no target month/year provided, use current month
    const now = new Date()
    const month = targetMonth ?? now.getMonth() + 1
    const year = targetYear ?? now.getFullYear()

    console.log(`Syncing monthly service summary for ${month}/${year}`)

    // Delete existing records for this month/year
    await sql`
      DELETE FROM monthly_service_summary 
      WHERE month = ${month} AND year = ${year}
    `

    // Insert aggregated data for the target month/year
    const result = await sql`
      INSERT INTO monthly_service_summary (
        client_name, 
        month, 
        year, 
        total_contacts, 
        services_completed, 
        services_pending, 
        last_contact_date,
        created_at,
        updated_at
      )
      SELECT 
        c.client_name,
        ${month} as month,
        ${year} as year,
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN c.service_completed = true THEN 1 END) as services_completed,
        COUNT(CASE WHEN c.service_completed = false THEN 1 END) as services_pending,
        MAX(c.contact_date) as last_contact_date,
        NOW() as created_at,
        NOW() as updated_at
      FROM contacts c
      WHERE EXTRACT(MONTH FROM c.contact_date) = ${month}
        AND EXTRACT(YEAR FROM c.contact_date) = ${year}
      GROUP BY c.client_name
      HAVING COUNT(*) > 0
    `

    const recordsProcessed = result.length

    return {
      success: true,
      message: `Successfully synced ${recordsProcessed} client records for ${month}/${year}`,
      recordsProcessed,
    }
  } catch (error) {
    console.error("Error syncing monthly service summary:", error)
    return {
      success: false,
      message: `Failed to sync monthly service summary: ${error instanceof Error ? error.message : "Unknown error"}`,
      recordsProcessed: 0,
    }
  }
}
