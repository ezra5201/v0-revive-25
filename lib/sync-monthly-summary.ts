import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Service mappings - EXACT same as populate script
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

/**
 * Synchronizes monthly service summary data for a specific month and year
 * Uses EXACT same logic as populate-monthly-service-summary.ts script
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

  let totalRecordsProcessed = 0

  try {
    // Process each service type separately - EXACT same logic as populate script
    for (const [columnPrefix, serviceName] of Object.entries(serviceMap)) {
      // Aggregate data for this specific service and month
      const serviceData = await sql`
        SELECT 
          SUM(${sql(columnPrefix + "_requested")}) as total_requested,
          SUM(${sql(columnPrefix + "_provided")}) as total_provided
        FROM contacts
        WHERE EXTRACT(YEAR FROM contact_date) = ${year}
          AND EXTRACT(MONTH FROM contact_date) = ${month}
          AND contact_date IS NOT NULL
      `

      const totalRequested = Number(serviceData[0]?.total_requested || 0)
      const totalProvided = Number(serviceData[0]?.total_provided || 0)

      // Skip if no data for this service/month
      if (totalRequested === 0 && totalProvided === 0) {
        continue
      }

      // Calculate completion rate - EXACT same formula as populate script
      const completionRate = totalRequested > 0 ? 
        Math.round(((totalProvided * 100.0) / totalRequested) * 100) / 100 : 0

      // Upsert the data - EXACT same as populate script
      await sql`
        INSERT INTO monthly_service_summary (year, month, service_name, total_requested, total_provided, completion_rate)
        VALUES (${year}, ${month}, ${serviceName}, ${totalRequested}, ${totalProvided}, ${completionRate})
        ON CONFLICT (year, month, service_name) 
        DO UPDATE SET 
          total_requested = EXCLUDED.total_requested,
          total_provided = EXCLUDED.total_provided,
          completion_rate = EXCLUDED.completion_rate
      `

      totalRecordsProcessed++
      console.log(`[${timestamp}] ${serviceName}: ${totalRequested} requested, ${totalProvided} provided`)
    }

    const successMessage = `Successfully synced ${totalRecordsProcessed} service records for ${year}-${month.toString().padStart(2, "0")}`
    console.log(`[${timestamp}] ${successMessage}`)

    return {
      success: true,
      message: successMessage,
      recordsProcessed: totalRecordsProcessed,
    }
  } catch (error) {
    const errorMessage = `Failed to sync ${year}-${month.toString().padStart(2, "0")}: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(`[${timestamp}] ${errorMessage}`)

    return {
      success: false,
      message: errorMessage,
      recordsProcessed: totalRecordsProcessed,
    }
  }
}
