#!/usr/bin/env node

import { neon } from "@neondatabase/serverless"
import { syncMonthlyServiceSummary } from "../lib/sync-monthly-summary"

const sql = neon(process.env.DATABASE_URL!)

interface DateRange {
  earliest: string | null
  latest: string | null
}

interface SyncStats {
  totalMonths: number
  successfulMonths: number
  failedMonths: number
  totalRecordsProcessed: number
  failedSyncs: Array<{ month: number; year: number; error: string }>
}

/**
 * Gets the date range of all contacts in the database
 */
async function getContactDateRange(): Promise<DateRange> {
  try {
    const result = await sql`
      SELECT 
        MIN(contact_date) as earliest,
        MAX(contact_date) as latest
      FROM contacts
      WHERE contact_date IS NOT NULL
    `

    return {
      earliest: result[0]?.earliest || null,
      latest: result[0]?.latest || null,
    }
  } catch (error) {
    console.error("Failed to get contact date range:", error)
    return { earliest: null, latest: null }
  }
}

/**
 * Generates array of {month, year} objects between two dates
 */
function generateMonthRange(startDate: string, endDate: string): Array<{ month: number; year: number }> {
  const months: Array<{ month: number; year: number }> = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

  while (current <= endMonth) {
    months.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
    })
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

/**
 * Main execution function
 */
async function main() {
  const isDryRun = process.argv.includes("--dry-run")
  const startTime = Date.now()

  console.log("🔄 Historical Monthly Service Summary Sync")
  console.log("==========================================")
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE SYNC"}`)
  console.log(`Started: ${new Date().toISOString()}`)
  console.log("")

  // Get the date range
  console.log("📅 Detecting data range...")
  const dateRange = await getContactDateRange()

  if (!dateRange.earliest || !dateRange.latest) {
    console.log("❌ No contact data found in database")
    process.exit(1)
  }

  console.log(`📊 Data range detected:`)
  console.log(`   Earliest contact: ${dateRange.earliest}`)
  console.log(`   Latest contact: ${dateRange.latest}`)
  console.log("")

  // Generate month range
  const monthsToProcess = generateMonthRange(dateRange.earliest, dateRange.latest)
  console.log(`📋 Found ${monthsToProcess.length} months to process`)
  console.log("")

  if (isDryRun) {
    console.log("🔍 DRY RUN - Would process these months:")
    monthsToProcess.forEach((month, index) => {
      console.log(`   ${index + 1}. ${month.year}-${month.month.toString().padStart(2, "0")}`)
    })
    console.log("")
    console.log("Run without --dry-run to execute the sync")
    process.exit(0)
  }

  // Process each month
  const stats: SyncStats = {
    totalMonths: monthsToProcess.length,
    successfulMonths: 0,
    failedMonths: 0,
    totalRecordsProcessed: 0,
    failedSyncs: [],
  }

  for (let i = 0; i < monthsToProcess.length; i++) {
    const { month, year } = monthsToProcess[i]
    const monthStr = `${year}-${month.toString().padStart(2, "0")}`

    console.log(`⏳ Processing ${monthStr} (${i + 1} of ${monthsToProcess.length})`)

    try {
      const result = await syncMonthlyServiceSummary(month, year)

      if (result.success) {
        stats.successfulMonths++
        stats.totalRecordsProcessed += result.recordsProcessed
        console.log(`✅ ${monthStr}: ${result.recordsProcessed} records processed`)
      } else {
        stats.failedMonths++
        stats.failedSyncs.push({ month, year, error: result.message })
        console.log(`❌ ${monthStr}: ${result.message}`)
      }
    } catch (error) {
      stats.failedMonths++
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      stats.failedSyncs.push({ month, year, error: errorMessage })
      console.log(`❌ ${monthStr}: ${errorMessage}`)
    }

    // Small delay to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Final summary
  const executionTime = Date.now() - startTime
  console.log("")
  console.log("📊 SYNC SUMMARY")
  console.log("===============")
  console.log(`Total months processed: ${stats.totalMonths}`)
  console.log(`Successful syncs: ${stats.successfulMonths}`)
  console.log(`Failed syncs: ${stats.failedMonths}`)
  console.log(`Total records processed: ${stats.totalRecordsProcessed}`)
  console.log(`Execution time: ${(executionTime / 1000).toFixed(2)}s`)
  console.log(`Date range covered: ${dateRange.earliest} to ${dateRange.latest}`)

  if (stats.failedSyncs.length > 0) {
    console.log("")
    console.log("❌ FAILED SYNCS:")
    stats.failedSyncs.forEach(({ month, year, error }) => {
      console.log(`   ${year}-${month.toString().padStart(2, "0")}: ${error}`)
    })
  }

  console.log("")
  console.log(`Completed: ${new Date().toISOString()}`)

  process.exit(stats.failedMonths > 0 ? 1 : 0)
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}
