#!/usr/bin/env tsx

import { neon } from "@neondatabase/serverless"
import { syncMonthlyServiceSummary } from "../lib/sync-monthly-summary"

/**
 * Summary of the historical sync operation
 */
interface SyncSummary {
  totalMonths: number
  successfulMonths: number
  failedMonths: number
  totalRecordsProcessed: number
  dateRange: {
    earliest: string
    latest: string
  }
  duration: number
  failedMonthDetails: Array<{
    month: number
    year: number
    error: string
  }>
}

/**
 * Date range found in the contacts table
 */
interface DateRange {
  earliest: Date | null
  latest: Date | null
}

/**
 * Get the date range of contacts in the database
 */
async function getContactDateRange(): Promise<DateRange> {
  const sql = neon(process.env.DATABASE_URL!)

  console.log("🔍 Querying contact date range...")

  const result = await sql`
    SELECT 
      MIN(contact_date) as earliest,
      MAX(contact_date) as latest
    FROM contacts
    WHERE contact_date IS NOT NULL
  `

  const row = result[0]
  return {
    earliest: row.earliest ? new Date(row.earliest) : null,
    latest: row.latest ? new Date(row.latest) : null,
  }
}

/**
 * Generate list of months to sync based on date range
 */
function generateMonthsToSync(earliest: Date, latest: Date): Array<{ month: number; year: number }> {
  const months: Array<{ month: number; year: number }> = []

  const current = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
  const end = new Date(latest.getFullYear(), latest.getMonth(), 1)

  while (current <= end) {
    months.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

/**
 * Format month/year for display
 */
function formatMonth(month: number, year: number): string {
  return `${year}-${month.toString().padStart(2, "0")}`
}

/**
 * Main sync function
 */
async function syncAllHistorical(dryRun = false): Promise<void> {
  const startTime = Date.now()
  console.log("🚀 Starting historical sync process...")

  if (dryRun) {
    console.log("📋 DRY RUN MODE - No actual syncing will be performed")
  }

  try {
    // Get date range from contacts
    const dateRange = await getContactDateRange()

    if (!dateRange.earliest || !dateRange.latest) {
      console.log("❌ No contact data found in database")
      return
    }

    console.log(`📅 Date range found:`)
    console.log(`   Earliest: ${dateRange.earliest.toISOString().split("T")[0]}`)
    console.log(`   Latest: ${dateRange.latest.toISOString().split("T")[0]}`)

    // Generate months to sync
    const monthsToSync = generateMonthsToSync(dateRange.earliest, dateRange.latest)
    console.log(`📊 Total months to process: ${monthsToSync.length}`)

    if (dryRun) {
      console.log("\n📋 Months that would be processed:")
      monthsToSync.forEach((month, index) => {
        console.log(`   ${index + 1}. ${formatMonth(month.month, month.year)}`)
      })
      console.log("\n✅ Dry run complete - no data was modified")
      return
    }

    // Initialize summary
    const summary: SyncSummary = {
      totalMonths: monthsToSync.length,
      successfulMonths: 0,
      failedMonths: 0,
      totalRecordsProcessed: 0,
      dateRange: {
        earliest: dateRange.earliest.toISOString().split("T")[0],
        latest: dateRange.latest.toISOString().split("T")[0],
      },
      duration: 0,
      failedMonthDetails: [],
    }

    console.log("\n🔄 Starting synchronization...\n")

    // Process each month chronologically
    for (let i = 0; i < monthsToSync.length; i++) {
      const { month, year } = monthsToSync[i]
      const monthStr = formatMonth(month, year)
      const progress = `${i + 1} of ${monthsToSync.length}`

      console.log(`⏳ Processing ${monthStr} (${progress})...`)

      try {
        const result = await syncMonthlyServiceSummary(month, year)

        if (result.success) {
          summary.successfulMonths++
          summary.totalRecordsProcessed += result.recordsProcessed
          console.log(`✅ ${monthStr}: ${result.recordsProcessed} records processed (${result.duration}ms)`)
        } else {
          summary.failedMonths++
          summary.failedMonthDetails.push({
            month,
            year,
            error: result.error || result.message,
          })
          console.log(`❌ ${monthStr}: ${result.message}`)
        }

        // Small delay to prevent overwhelming the database
        if (i < monthsToSync.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      } catch (error) {
        summary.failedMonths++
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        summary.failedMonthDetails.push({
          month,
          year,
          error: errorMessage,
        })
        console.log(`❌ ${monthStr}: ${errorMessage}`)
      }
    }

    // Calculate final duration
    summary.duration = Date.now() - startTime

    // Print summary report
    console.log("\n" + "=".repeat(60))
    console.log("📊 HISTORICAL SYNC SUMMARY REPORT")
    console.log("=".repeat(60))
    console.log(`📅 Date Range: ${summary.dateRange.earliest} to ${summary.dateRange.latest}`)
    console.log(`📈 Total Months: ${summary.totalMonths}`)
    console.log(`✅ Successful: ${summary.successfulMonths}`)
    console.log(`❌ Failed: ${summary.failedMonths}`)
    console.log(`📊 Total Records Processed: ${summary.totalRecordsProcessed}`)
    console.log(`⏱️  Total Duration: ${(summary.duration / 1000).toFixed(2)} seconds`)

    if (summary.failedMonthDetails.length > 0) {
      console.log("\n❌ Failed Months:")
      summary.failedMonthDetails.forEach((failure) => {
        console.log(`   ${formatMonth(failure.month, failure.year)}: ${failure.error}`)
      })
    }

    console.log("\n🎉 Historical sync process completed!")

    if (summary.failedMonths > 0) {
      process.exit(1) // Exit with error code if there were failures
    }
  } catch (error) {
    console.error("💥 Fatal error during historical sync:", error)
    process.exit(1)
  }
}

// Check for command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")

// Run the sync
syncAllHistorical(dryRun).catch((error) => {
  console.error("💥 Unhandled error:", error)
  process.exit(1)
})
