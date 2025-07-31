import { neon } from "@neondatabase/serverless"

/**
 * Result of a monthly service summary synchronization operation
 */
export interface SyncResult {
  success: boolean
  month: number
  year: number
  recordsProcessed: number
  message: string
  timestamp: string
  duration: number
  error?: string
}

/**
 * Synchronizes monthly service summary data for a specific month and year
 *
 * @param targetMonth - Month to sync (1-12), defaults to current month
 * @param targetYear - Year to sync (1900-2099), defaults to current year
 * @returns Promise<SyncResult> - Result of the synchronization operation
 */
export async function syncMonthlyServiceSummary(targetMonth?: number, targetYear?: number): Promise<SyncResult> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  // Default to current month/year if not provided
  const now = new Date()
  const month = targetMonth ?? now.getMonth() + 1
  const year = targetYear ?? now.getFullYear()

  console.log(`[${timestamp}] Starting sync for ${year}-${month.toString().padStart(2, "0")}`)

  // Parameter validation
  if (month < 1 || month > 12) {
    const error = `Invalid month: ${month}. Must be between 1 and 12.`
    console.error(`[${timestamp}] ${error}`)
    return {
      success: false,
      month,
      year,
      recordsProcessed: 0,
      message: error,
      timestamp,
      duration: Date.now() - startTime,
      error,
    }
  }

  if (year < 1900 || year > 2099) {
    const error = `Invalid year: ${year}. Must be between 1900 and 2099.`
    console.error(`[${timestamp}] ${error}`)
    return {
      success: false,
      month,
      year,
      recordsProcessed: 0,
      message: error,
      timestamp,
      duration: Date.now() - startTime,
      error,
    }
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    console.log(`[${timestamp}] Connected to database`)

    // Service mapping (identical to Phase 1 script)
    const serviceMapping = {
      Shower: "shower",
      Laundry: "laundry",
      Meal: "meal",
      Clothing: "clothing",
      Mail: "mail",
      Phone: "phone",
      Computer: "computer",
      "Case Management": "case_management",
      Benefits: "benefits",
      Housing: "housing",
      Medical: "medical",
      "Mental Health": "mental_health",
      "Substance Abuse": "substance_abuse",
      Legal: "legal",
      Transportation: "transportation",
      "ID/Docs": "id_docs",
      Storage: "storage",
      Other: "other",
    }

    // First, delete existing data for this month/year
    console.log(`[${timestamp}] Deleting existing data for ${year}-${month.toString().padStart(2, "0")}`)
    await sql`
      DELETE FROM monthly_service_summary 
      WHERE month = ${month} AND year = ${year}
    `

    // Get all contacts for the target month/year
    console.log(`[${timestamp}] Querying contacts for ${year}-${month.toString().padStart(2, "0")}`)
    const contacts = await sql`
      SELECT 
        name,
        services,
        contact_date
      FROM contacts 
      WHERE EXTRACT(MONTH FROM contact_date) = ${month}
        AND EXTRACT(YEAR FROM contact_date) = ${year}
    `

    console.log(`[${timestamp}] Found ${contacts.length} contacts to process`)

    if (contacts.length === 0) {
      const message = `No contacts found for ${year}-${month.toString().padStart(2, "0")}`
      console.log(`[${timestamp}] ${message}`)
      return {
        success: true,
        month,
        year,
        recordsProcessed: 0,
        message,
        timestamp,
        duration: Date.now() - startTime,
      }
    }

    // Process each contact and aggregate services
    const clientServiceCounts: Record<string, Record<string, number>> = {}

    for (const contact of contacts) {
      const clientName = contact.name

      if (!clientServiceCounts[clientName]) {
        clientServiceCounts[clientName] = {}
      }

      // Parse services (assuming comma-separated string)
      const services = contact.services ? contact.services.split(",").map((s: string) => s.trim()) : []

      for (const service of services) {
        const mappedService = serviceMapping[service as keyof typeof serviceMapping]
        if (mappedService) {
          clientServiceCounts[clientName][mappedService] = (clientServiceCounts[clientName][mappedService] || 0) + 1
        }
      }
    }

    // Insert aggregated data into monthly_service_summary
    let recordsInserted = 0

    for (const [clientName, serviceCounts] of Object.entries(clientServiceCounts)) {
      console.log(`[${timestamp}] Processing client: ${clientName}`)

      await sql`
        INSERT INTO monthly_service_summary (
          client_name, month, year,
          shower, laundry, meal, clothing, mail, phone, computer,
          case_management, benefits, housing, medical, mental_health,
          substance_abuse, legal, transportation, id_docs, storage, other
        ) VALUES (
          ${clientName}, ${month}, ${year},
          ${serviceCounts.shower || 0},
          ${serviceCounts.laundry || 0},
          ${serviceCounts.meal || 0},
          ${serviceCounts.clothing || 0},
          ${serviceCounts.mail || 0},
          ${serviceCounts.phone || 0},
          ${serviceCounts.computer || 0},
          ${serviceCounts.case_management || 0},
          ${serviceCounts.benefits || 0},
          ${serviceCounts.housing || 0},
          ${serviceCounts.medical || 0},
          ${serviceCounts.mental_health || 0},
          ${serviceCounts.substance_abuse || 0},
          ${serviceCounts.legal || 0},
          ${serviceCounts.transportation || 0},
          ${serviceCounts.id_docs || 0},
          ${serviceCounts.storage || 0},
          ${serviceCounts.other || 0}
        )
      `

      recordsInserted++
    }

    const duration = Date.now() - startTime
    const message = `Successfully processed ${recordsInserted} client records for ${year}-${month.toString().padStart(2, "0")}`

    console.log(`[${timestamp}] ${message} (${duration}ms)`)

    return {
      success: true,
      month,
      year,
      recordsProcessed: recordsInserted,
      message,
      timestamp,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    console.error(`[${timestamp}] Sync failed for ${year}-${month.toString().padStart(2, "0")}: ${errorMessage}`)

    return {
      success: false,
      month,
      year,
      recordsProcessed: 0,
      message: `Sync failed: ${errorMessage}`,
      timestamp,
      duration,
      error: errorMessage,
    }
  }
}
