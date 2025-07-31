import { neon } from "@neondatabase/serverless"

/**
 * Service mapping configuration for monthly summary synchronization
 */
const SERVICE_MAPPINGS = [
  { requested: "case_management_requested", provided: "case_management_provided", name: "Case Management" },
  {
    requested: "occupational_therapy_requested",
    provided: "occupational_therapy_provided",
    name: "Occupational Therapy",
  },
  { requested: "food_requested", provided: "food_provided", name: "Food" },
  { requested: "healthcare_requested", provided: "healthcare_provided", name: "Healthcare" },
  { requested: "housing_requested", provided: "housing_provided", name: "Housing" },
  { requested: "employment_requested", provided: "employment_provided", name: "Employment" },
  { requested: "benefits_requested", provided: "benefits_provided", name: "Benefits" },
  { requested: "legal_requested", provided: "legal_provided", name: "Legal" },
  { requested: "transportation_requested", provided: "transportation_provided", name: "Transportation" },
  { requested: "childcare_requested", provided: "childcare_provided", name: "Childcare" },
  { requested: "mental_health_requested", provided: "mental_health_provided", name: "Mental Health" },
  { requested: "substance_abuse_requested", provided: "substance_abuse_provided", name: "Substance Abuse" },
  { requested: "education_requested", provided: "education_provided", name: "Education" },
]

export interface SyncResult {
  success: boolean
  processedRecords: number
  targetMonth: number
  targetYear: number
  duration: number
  errors: string[]
  details: {
    serviceName: string
    requested: number
    provided: number
    completionRate: number
  }[]
}

/**
 * Validates month and year parameters
 */
function validateParameters(month: number, year: number): string[] {
  const errors: string[] = []

  if (month < 1 || month > 12) {
    errors.push(`Invalid month: ${month}. Must be between 1 and 12.`)
  }

  if (year < 2020 || year > 2030) {
    errors.push(`Invalid year: ${year}. Must be between 2020 and 2030.`)
  }

  return errors
}

/**
 * Logs message with timestamp
 */
function logWithTimestamp(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

/**
 * Synchronizes monthly service summary data for a specific month/year
 * @param targetMonth - Target month (1-12), defaults to current month
 * @param targetYear - Target year (2020-2030), defaults to current year
 * @returns Promise<SyncResult> - Sync operation results
 */
export async function syncMonthlyServiceSummary(targetMonth?: string, targetYear?: number): Promise<SyncResult> {
  const startTime = Date.now()
  const now = new Date()

  // Default to current month/year if not provided
  const month = targetMonth ? Number.parseInt(targetMonth, 10) : now.getMonth() + 1
  const year = targetYear || now.getFullYear()

  logWithTimestamp(`Starting sync for ${year}-${month.toString().padStart(2, "0")}`)

  // Validate parameters
  const validationErrors = validateParameters(month, year)
  if (validationErrors.length > 0) {
    return {
      success: false,
      processedRecords: 0,
      targetMonth: month,
      targetYear: year,
      duration: Date.now() - startTime,
      errors: validationErrors,
      details: [],
    }
  }

  const sql = neon(process.env.DATABASE_URL!)
  const errors: string[] = []
  const details: SyncResult["details"] = []
  let totalProcessed = 0

  try {
    logWithTimestamp(`Processing ${SERVICE_MAPPINGS.length} service types`)

    for (const service of SERVICE_MAPPINGS) {
      try {
        logWithTimestamp(`Processing ${service.name}...`)

        // Query to aggregate service data for the target month/year
        const aggregateQuery = `
          SELECT 
            COALESCE(SUM(${service.requested}), 0) as total_requested,
            COALESCE(SUM(${service.provided}), 0) as total_provided,
            ROUND((COALESCE(SUM(${service.provided}), 0) * 100.0 / NULLIF(COALESCE(SUM(${service.requested}), 0), 0)), 2) as completion_rate
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = $1 
            AND EXTRACT(MONTH FROM contact_date) = $2
        `

        const result = await sql(aggregateQuery, [year, month])
        const data = result[0]

        const totalRequested = Number.parseInt(data.total_requested) || 0
        const totalProvided = Number.parseInt(data.total_provided) || 0
        const completionRate = Number.parseFloat(data.completion_rate) || 0

        // Upsert into monthly_service_summary
        const upsertQuery = `
          INSERT INTO monthly_service_summary (year, month, service_name, total_requested, total_provided, completion_rate)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (year, month, service_name) 
          DO UPDATE SET 
            total_requested = EXCLUDED.total_requested,
            total_provided = EXCLUDED.total_provided,
            completion_rate = EXCLUDED.completion_rate,
            updated_at = CURRENT_TIMESTAMP
        `

        await sql(upsertQuery, [year, month, service.name, totalRequested, totalProvided, completionRate])

        details.push({
          serviceName: service.name,
          requested: totalRequested,
          provided: totalProvided,
          completionRate,
        })

        totalProcessed++
        logWithTimestamp(
          `✓ ${service.name}: ${totalRequested} requested, ${totalProvided} provided (${completionRate}%)`,
        )
      } catch (serviceError) {
        const errorMsg = `Failed to process ${service.name}: ${serviceError}`
        errors.push(errorMsg)
        logWithTimestamp(`✗ ${errorMsg}`)
      }
    }

    const duration = Date.now() - startTime
    logWithTimestamp(`Sync completed in ${duration}ms. Processed ${totalProcessed} services.`)

    return {
      success: errors.length === 0,
      processedRecords: totalProcessed,
      targetMonth: month,
      targetYear: year,
      duration,
      errors,
      details,
    }
  } catch (error) {
    const errorMsg = `Sync failed: ${error}`
    errors.push(errorMsg)
    logWithTimestamp(`✗ ${errorMsg}`)

    return {
      success: false,
      processedRecords: totalProcessed,
      targetMonth: month,
      targetYear: year,
      duration: Date.now() - startTime,
      errors,
      details,
    }
  }
}
