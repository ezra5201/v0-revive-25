#!/usr/bin/env node

import { neon } from "@neondatabase/serverless"
import { syncMonthlyServiceSummary } from "../lib/sync-monthly-summary"

const sql = neon(process.env.DATABASE_URL!)

async function syncAllHistorical() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log(`🚀 Starting ${isDryRun ? "DRY RUN" : "historical sync"}...`)
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`)

  try {
    // Query the contacts table to find the full date range
    console.log("📊 Detecting data range...")
    const dateRange = await sql`
      SELECT 
        MIN(contact_date) as earliest,
        MAX(contact_date) as latest,
        COUNT(*) as total_contacts
      FROM contacts
    `

    if (dateRange.length === 0 || !dateRange[0].earliest) {
      console.log("❌ No contact data found in database")
      return
    }

    const earliest = new Date(dateRange[0].earliest)
    const latest = new Date(dateRange[0].latest)
    const totalContacts = dateRange[0].total_contacts

    console.log(`📅 Data range: ${earliest.toISOString().split("T")[0]} to ${latest.toISOString().split("T")[0]}`)
    console.log(`📈 Total contacts: ${totalContacts}\n`)

    // Generate list of all months to process
    const monthsToProcess: Array<{ month: number; year: number }> = []
    const current = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
    const end = new Date(latest.getFullYear(), latest.getMonth(), 1)

    while (current <= end) {
      monthsToProcess.push({
        month: current.getMonth() + 1,
        year: current.getFullYear(),
      })
      current.setMonth(current.getMonth() + 1)
    }

    console.log(`📋 Found ${monthsToProcess.length} months to process`)

    if (isDryRun) {
      console.log("\n🔍 DRY RUN - Would process these months:")
      monthsToProcess.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.year}-${item.month.toString().padStart(2, "0")}`)
      })
      console.log("\n✅ Dry run complete. Use without --dry-run to execute.")
      return
    }

    // Process each month chronologically
    let successCount = 0
    let failureCount = 0
    let totalRecordsProcessed = 0

    for (let i = 0; i < monthsToProcess.length; i++) {
      const { month, year } = monthsToProcess[i]
      const progress = `(${i + 1} of ${monthsToProcess.length})`

      console.log(`🔄 Processing ${year}-${month.toString().padStart(2, "0")} ${progress}...`)

      try {
        const result = await syncMonthlyServiceSummary(month, year)

        if (result.success) {
          successCount++
          totalRecordsProcessed += result.recordsProcessed
          console.log(`   ✅ ${result.message}`)
        } else {
          failureCount++
          console.log(`   ❌ ${result.message}`)
        }
      } catch (error) {
        failureCount++
        console.log(
          `   ❌ Error processing ${year}-${month.toString().padStart(2, "0")}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    // Summary report
    console.log("\n📊 SYNC SUMMARY REPORT")
    console.log("========================")
    console.log(
      `📅 Date range covered: ${earliest.toISOString().split("T")[0]} to ${latest.toISOString().split("T")[0]}`,
    )
    console.log(`📈 Total months processed: ${monthsToProcess.length}`)
    console.log(`✅ Successful months: ${successCount}`)
    console.log(`❌ Failed months: ${failureCount}`)
    console.log(`📊 Total records processed: ${totalRecordsProcessed}`)
    console.log(`⏰ Completed at: ${new Date().toISOString()}`)

    if (failureCount > 0) {
      console.log("\n⚠️  Some months failed to process. Check the logs above for details.")
      process.exit(1)
    } else {
      console.log("\n🎉 All historical data synced successfully!")
    }
  } catch (error) {
    console.error("\n💥 Fatal error during historical sync:", error)
    process.exit(1)
  }
}

// Execute the script
syncAllHistorical().catch(console.error)
