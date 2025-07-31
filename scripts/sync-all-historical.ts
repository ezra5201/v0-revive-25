import { neon } from "@neondatabase/serverless"
import { syncMonthlyServiceSummary } from "../lib/sync-monthly-summary"

async function syncAllHistoricalData() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    console.log("Starting historical data sync...")

    // Get the date range from contacts table
    const dateRange = await sql`
      SELECT 
        MIN(contact_date) as min_date,
        MAX(contact_date) as max_date
      FROM contacts
      WHERE contact_date IS NOT NULL
    `

    if (!dateRange[0] || !dateRange[0].min_date || !dateRange[0].max_date) {
      console.log("No contact dates found in database")
      return
    }

    const minDate = new Date(dateRange[0].min_date)
    const maxDate = new Date(dateRange[0].max_date)

    console.log(`Processing data from ${minDate.toISOString().slice(0, 7)} to ${maxDate.toISOString().slice(0, 7)}`)

    // Process each month chronologically
    const currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

    let totalProcessed = 0
    let successCount = 0
    let errorCount = 0

    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()

      console.log(`Processing ${month}/${year}...`)

      const result = await syncMonthlyServiceSummary(month, year)

      if (result.success) {
        successCount++
        totalProcessed += result.recordsProcessed
        console.log(`✓ ${result.message}`)
      } else {
        errorCount++
        console.error(`✗ ${result.message}`)
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    console.log("\n=== SYNC COMPLETE ===")
    console.log(`Successful months: ${successCount}`)
    console.log(`Failed months: ${errorCount}`)
    console.log(`Total records processed: ${totalProcessed}`)
  } catch (error) {
    console.error("Fatal error during historical sync:", error)
    process.exit(1)
  }
}

// Execute the sync
syncAllHistoricalData()
  .then(() => {
    console.log("Historical sync completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Historical sync failed:", error)
    process.exit(1)
  })
