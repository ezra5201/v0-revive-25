#!/usr/bin/env npx tsx

import { syncMonthlyServiceSummary } from "../lib/sync-monthly-summary"

/**
 * One-time historical sync script
 * Processes all months from January 2024 to current month
 * Usage: npx tsx scripts/sync-all-historical.ts
 */
async function syncAllHistoricalData() {
  console.log("🚀 Starting historical data synchronization...")
  console.log("=".repeat(60))

  const startTime = Date.now()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const monthsToSync = []
  let totalRecordsProcessed = 0
  let successCount = 0
  let errorCount = 0

  // Generate all months from January 2024 to current month
  for (let year = 2024; year <= currentYear; year++) {
    const startMonth = year === 2024 ? 1 : 1
    const endMonth = year === currentYear ? currentMonth : 12

    for (let month = startMonth; month <= endMonth; month++) {
      monthsToSync.push({ month, year })
    }
  }

  console.log(
    `📅 Found ${monthsToSync.length} months to process (Jan 2024 - ${getMonthName(currentMonth)} ${currentYear})`,
  )
  console.log("")

  // Process each month
  for (let i = 0; i < monthsToSync.length; i++) {
    const { month, year } = monthsToSync[i]
    const progress = `[${i + 1}/${monthsToSync.length}]`

    console.log(`${progress} Processing ${getMonthName(month)} ${year}...`)

    try {
      const result = await syncMonthlyServiceSummary(month, year)

      if (result.success) {
        successCount++
        totalRecordsProcessed += result.recordsProcessed
        console.log(`✅ ${progress} Success: ${result.recordsProcessed} records processed`)
      } else {
        errorCount++
        console.log(`❌ ${progress} Failed: ${result.message}`)
      }
    } catch (error) {
      errorCount++
      console.log(`❌ ${progress} Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    // Small delay to prevent overwhelming the database
    if (i < monthsToSync.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  const endTime = Date.now()
  const totalDuration = endTime - startTime

  // Summary report
  console.log("")
  console.log("=".repeat(60))
  console.log("📊 SYNCHRONIZATION SUMMARY")
  console.log("=".repeat(60))
  console.log(`Total months processed: ${monthsToSync.length}`)
  console.log(`Successful syncs: ${successCount}`)
  console.log(`Failed syncs: ${errorCount}`)
  console.log(`Total records processed: ${totalRecordsProcessed}`)
  console.log(`Total duration: ${Math.round(totalDuration / 1000)}s`)
  console.log(`Average per month: ${Math.round(totalDuration / monthsToSync.length)}ms`)

  if (errorCount === 0) {
    console.log("🎉 All synchronizations completed successfully!")
  } else {
    console.log(`⚠️  ${errorCount} synchronizations failed. Check logs above for details.`)
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

/**
 * Helper function to get month name from number
 */
function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1] || "Unknown"
}

// Run the script
if (require.main === module) {
  syncAllHistoricalData().catch((error) => {
    console.error("💥 Script failed:", error)
    process.exit(1)
  })
}
