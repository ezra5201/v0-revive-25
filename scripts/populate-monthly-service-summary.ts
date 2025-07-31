import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Service mappings with exact column names and display names
const serviceMap = {
  case_management: "Case Management",
  occupational_therapy: "Occupational Therapy",
  food: "Food",
  healthcare: "Healthcare",
  housing: "Housing",
  employment: "Employment",
  benefits: "Benefits",
  legal: "Legal",
  transportation: "Transportation",
  childcare: "Childcare",
  mental_health: "Mental Health",
  substance_abuse: "Substance Abuse",
  education: "Education",
}

async function populateMonthlyServiceSummary() {
  console.log("🚀 Starting monthly service summary population...")

  try {
    // Get date range from contacts table
    const dateRange = await sql`
      SELECT 
        MIN(contact_date) as min_date,
        MAX(contact_date) as max_date,
        COUNT(*) as total_contacts
      FROM contacts
    `

    console.log(`📊 Processing contacts from ${dateRange[0].min_date} to ${dateRange[0].max_date}`)
    console.log(`📈 Total contacts to process: ${dateRange[0].total_contacts}`)

    // Process each service type separately
    for (const [columnPrefix, serviceName] of Object.entries(serviceMap)) {
      console.log(`\n🔄 Processing service: ${serviceName} (${columnPrefix})`)

      try {
        // Aggregate data for this service by year/month
        const serviceData = await sql`
          SELECT 
            EXTRACT(YEAR FROM contact_date) as year,
            EXTRACT(MONTH FROM contact_date) as month,
            SUM(${sql(columnPrefix + "_requested")}) as total_requested,
            SUM(${sql(columnPrefix + "_provided")}) as total_provided
          FROM contacts
          WHERE contact_date IS NOT NULL
          GROUP BY EXTRACT(YEAR FROM contact_date), EXTRACT(MONTH FROM contact_date)
          ORDER BY year, month
        `

        console.log(`  📅 Found ${serviceData.length} month(s) with ${serviceName} data`)

        // Insert/update each month's data
        for (const row of serviceData) {
          const year = Number(row.year)
          const month = Number(row.month)
          const totalRequested = Number(row.total_requested)
          const totalProvided = Number(row.total_provided)

          // Calculate completion rate
          const completionRate =
            totalRequested > 0 ? Math.round(((totalProvided * 100.0) / totalRequested) * 100) / 100 : 0

          console.log(
            `    📊 ${year}-${month.toString().padStart(2, "0")}: ${totalRequested} requested, ${totalProvided} provided (${completionRate}% completion)`,
          )

          // Upsert the data
          await sql`
            INSERT INTO monthly_service_summary (year, month, service_name, total_requested, total_provided, completion_rate)
            VALUES (${year}, ${month}, ${serviceName}, ${totalRequested}, ${totalProvided}, ${completionRate})
            ON CONFLICT (year, month, service_name) 
            DO UPDATE SET 
              total_requested = EXCLUDED.total_requested,
              total_provided = EXCLUDED.total_provided,
              completion_rate = EXCLUDED.completion_rate
          `
        }

        console.log(`  ✅ Successfully processed ${serviceName}`)
      } catch (error) {
        console.error(`  ❌ Error processing ${serviceName}:`, error)
        throw error
      }
    }

    console.log("\n🔍 Verification: Checking final row counts...")

    // Verification query
    const verification = await sql`
      SELECT 
        service_name,
        COUNT(*) as month_count,
        SUM(total_requested) as total_requested_sum,
        SUM(total_provided) as total_provided_sum,
        ROUND(AVG(completion_rate), 2) as avg_completion_rate
      FROM monthly_service_summary
      GROUP BY service_name
      ORDER BY service_name
    `

    console.log("\n📈 Final Summary by Service:")
    console.log(
      "Service Name".padEnd(20) + "Months".padEnd(8) + "Requested".padEnd(12) + "Provided".padEnd(12) + "Avg Rate",
    )
    console.log("-".repeat(65))

    for (const row of verification) {
      const serviceName = String(row.service_name).padEnd(20)
      const monthCount = String(row.month_count).padEnd(8)
      const totalRequested = String(row.total_requested_sum).padEnd(12)
      const totalProvided = String(row.total_provided_sum).padEnd(12)
      const avgRate = `${row.avg_completion_rate}%`

      console.log(`${serviceName}${monthCount}${totalRequested}${totalProvided}${avgRate}`)
    }

    // Overall summary
    const overallSummary = await sql`
      SELECT 
        COUNT(DISTINCT service_name) as unique_services,
        COUNT(*) as total_rows,
        MIN(year) as earliest_year,
        MAX(year) as latest_year
      FROM monthly_service_summary
    `

    console.log(`\n✅ Population complete!`)
    console.log(`📊 Total rows created/updated: ${overallSummary[0].total_rows}`)
    console.log(`🎯 Services processed: ${overallSummary[0].unique_services}`)
    console.log(`📅 Date range: ${overallSummary[0].earliest_year} - ${overallSummary[0].latest_year}`)
  } catch (error) {
    console.error("❌ Fatal error during population:", error)
    throw error
  }
}

// Execute the script
if (require.main === module) {
  populateMonthlyServiceSummary()
    .then(() => {
      console.log("🎉 Script completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Script failed:", error)
      process.exit(1)
    })
}

export { populateMonthlyServiceSummary }
