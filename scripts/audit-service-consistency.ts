import { neon } from "@neondatabase/serverless"
import { writeFileSync } from "fs"

const sql = neon(process.env.DATABASE_URL!)

// ANSI color codes for console output
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
}

// Expected service mappings from Phase 1
const expectedServiceMappings = {
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

interface AuditResults {
  timestamp: string
  integerColumnsAnalysis: any[]
  jsonbServicesAnalysis: any
  monthlyServiceSummaryAudit: any
  discrepancyReport: any
}

async function main() {
  console.log(`${colors.bold}${colors.blue}=== SERVICE CONSISTENCY AUDIT ===${colors.reset}\n`)

  const auditResults: AuditResults = {
    timestamp: new Date().toISOString(),
    integerColumnsAnalysis: [],
    jsonbServicesAnalysis: {},
    monthlyServiceSummaryAudit: {},
    discrepancyReport: {},
  }

  try {
    // SECTION A: Integer Columns Analysis
    console.log(`${colors.bold}${colors.blue}SECTION A: INTEGER COLUMNS ANALYSIS${colors.reset}`)
    console.log("=".repeat(50))

    const integerAnalysis = []

    for (const [columnPrefix, serviceName] of Object.entries(expectedServiceMappings)) {
      try {
        const result = await sql`
          SELECT 
            COUNT(*) as total_records,
            SUM(CASE WHEN ${sql(columnPrefix + "_requested")} > 0 THEN 1 ELSE 0 END) as requested_count,
            SUM(CASE WHEN ${sql(columnPrefix + "_provided")} > 0 THEN 1 ELSE 0 END) as provided_count,
            ROUND(
              (SUM(CASE WHEN ${sql(columnPrefix + "_provided")} > 0 THEN 1 ELSE 0 END) * 100.0 / 
               NULLIF(SUM(CASE WHEN ${sql(columnPrefix + "_requested")} > 0 THEN 1 ELSE 0 END), 0)), 2
            ) as completion_rate
          FROM contacts
        `

        const data = result[0]
        const analysisRow = {
          service_name: serviceName,
          requested_count: Number(data.requested_count),
          provided_count: Number(data.provided_count),
          completion_rate: data.completion_rate || 0,
          total_records: Number(data.total_records),
        }

        integerAnalysis.push(analysisRow)

        const status =
          analysisRow.requested_count > 0 ? `${colors.green}✓${colors.reset}` : `${colors.yellow}⚠${colors.reset}`

        console.log(
          `${status} ${serviceName}: ${analysisRow.requested_count} requested, ${analysisRow.provided_count} provided (${analysisRow.completion_rate}% completion)`,
        )
      } catch (error) {
        console.error(`${colors.red}✗ Error analyzing ${serviceName}:${colors.reset}`, error)
      }
    }

    console.table(integerAnalysis)
    auditResults.integerColumnsAnalysis = integerAnalysis

    // SECTION B: JSONB Services Analysis
    console.log(`\n${colors.bold}${colors.blue}SECTION B: JSONB SERVICES ANALYSIS${colors.reset}`)
    console.log("=".repeat(50))

    try {
      // Analyze services_requested JSONB
      const requestedServices = await sql`
        SELECT 
          jsonb_array_elements_text(services_requested) as service_name,
          COUNT(*) as frequency
        FROM contacts 
        WHERE services_requested IS NOT NULL 
          AND jsonb_array_length(services_requested) > 0
        GROUP BY jsonb_array_elements_text(services_requested)
        ORDER BY frequency DESC
      `

      // Analyze services_provided JSONB
      const providedServices = await sql`
        SELECT 
          jsonb_extract_path_text(jsonb_array_elements(services_provided), 'service') as service_name,
          COUNT(*) as frequency
        FROM contacts 
        WHERE services_provided IS NOT NULL 
          AND jsonb_array_length(services_provided) > 0
        GROUP BY jsonb_extract_path_text(jsonb_array_elements(services_provided), 'service')
        ORDER BY frequency DESC
      `

      console.log(`${colors.bold}Services Found in services_requested JSONB:${colors.reset}`)
      const requestedServiceNames = new Set()
      requestedServices.forEach((service) => {
        requestedServiceNames.add(service.service_name)
        const isExpected = Object.values(expectedServiceMappings).includes(service.service_name)
        const status = isExpected ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`
        console.log(`${status} "${service.service_name}": ${service.frequency} occurrences`)
      })

      console.log(`\n${colors.bold}Services Found in services_provided JSONB:${colors.reset}`)
      const providedServiceNames = new Set()
      providedServices.forEach((service) => {
        if (service.service_name) {
          providedServiceNames.add(service.service_name)
          const isExpected = Object.values(expectedServiceMappings).includes(service.service_name)
          const status = isExpected ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`
          console.log(`${status} "${service.service_name}": ${service.frequency} occurrences`)
        }
      })

      // Flag unexpected service names
      const allJsonbServices = new Set([...requestedServiceNames, ...providedServiceNames])
      const unexpectedServices = Array.from(allJsonbServices).filter(
        (service) => !Object.values(expectedServiceMappings).includes(service as string),
      )

      if (unexpectedServices.length > 0) {
        console.log(`\n${colors.red}${colors.bold}⚠ UNEXPECTED SERVICE NAMES FOUND:${colors.reset}`)
        unexpectedServices.forEach((service) => {
          console.log(`${colors.red}  - "${service}"${colors.reset}`)
        })
      } else {
        console.log(`\n${colors.green}✓ All JSONB service names match expected mappings${colors.reset}`)
      }

      auditResults.jsonbServicesAnalysis = {
        requestedServices: requestedServices,
        providedServices: providedServices,
        unexpectedServices: unexpectedServices,
      }
    } catch (error) {
      console.error(`${colors.red}✗ Error analyzing JSONB services:${colors.reset}`, error)
    }

    // SECTION C: Monthly Service Summary Audit
    console.log(`\n${colors.bold}${colors.blue}SECTION C: MONTHLY SERVICE SUMMARY AUDIT${colors.reset}`)
    console.log("=".repeat(50))

    try {
      const summaryServices = await sql`
        SELECT 
          service_name,
          COUNT(*) as total_records,
          MIN(year || '-' || LPAD(month::text, 2, '0')) as earliest_period,
          MAX(year || '-' || LPAD(month::text, 2, '0')) as latest_period,
          SUM(total_requested) as total_requested_sum,
          SUM(total_provided) as total_provided_sum
        FROM monthly_service_summary
        GROUP BY service_name
        ORDER BY service_name
      `

      console.log(`${colors.bold}Monthly Service Summary Table Contents:${colors.reset}`)
      console.table(
        summaryServices.map((service) => ({
          service_name: service.service_name,
          total_records: Number(service.total_records),
          date_range: `${service.earliest_period} to ${service.latest_period}`,
          total_requested: Number(service.total_requested_sum),
          total_provided: Number(service.total_provided_sum),
        })),
      )

      // Check for missing expected services
      const summaryServiceNames = new Set(summaryServices.map((s) => s.service_name))
      const expectedServiceNames = new Set(Object.values(expectedServiceMappings))
      const missingFromSummary = Array.from(expectedServiceNames).filter((service) => !summaryServiceNames.has(service))

      if (missingFromSummary.length > 0) {
        console.log(`\n${colors.yellow}⚠ SERVICES MISSING FROM MONTHLY SUMMARY:${colors.reset}`)
        missingFromSummary.forEach((service) => {
          console.log(`${colors.yellow}  - "${service}"${colors.reset}`)
        })
      } else {
        console.log(`\n${colors.green}✓ All expected services found in monthly summary${colors.reset}`)
      }

      auditResults.monthlyServiceSummaryAudit = {
        summaryServices: summaryServices,
        missingFromSummary: missingFromSummary,
      }
    } catch (error) {
      console.error(`${colors.red}✗ Error analyzing monthly service summary:${colors.reset}`, error)
    }

    // SECTION D: Discrepancy Report
    console.log(`\n${colors.bold}${colors.blue}SECTION D: DISCREPANCY REPORT${colors.reset}`)
    console.log("=".repeat(50))

    const discrepancies = {
      integerWithoutSummary: [],
      jsonbWithoutInteger: [],
      inconsistentNames: [],
      recommendations: [],
    }

    // Check for services with integer data but missing from summary
    const servicesWithIntegerData = integerAnalysis
      .filter((service) => service.requested_count > 0 || service.provided_count > 0)
      .map((service) => service.service_name)

    const summaryServiceNames =
      auditResults.monthlyServiceSummaryAudit.summaryServices?.map((s) => s.service_name) || []

    discrepancies.integerWithoutSummary = servicesWithIntegerData.filter(
      (service) => !summaryServiceNames.includes(service),
    )

    // Check for JSONB services without corresponding integer data
    const jsonbServiceNames = [
      ...(auditResults.jsonbServicesAnalysis.requestedServices?.map((s) => s.service_name) || []),
      ...(auditResults.jsonbServicesAnalysis.providedServices?.map((s) => s.service_name) || []),
    ]
    const uniqueJsonbServices = [...new Set(jsonbServiceNames)]

    const servicesWithoutIntegerData = uniqueJsonbServices.filter((jsonbService) => {
      return !integerAnalysis.some(
        (intService) =>
          intService.service_name === jsonbService && (intService.requested_count > 0 || intService.provided_count > 0),
      )
    })

    discrepancies.jsonbWithoutInteger = servicesWithoutIntegerData

    // Generate recommendations
    if (discrepancies.integerWithoutSummary.length > 0) {
      console.log(`\n${colors.red}${colors.bold}⚠ SERVICES WITH INTEGER DATA BUT MISSING FROM SUMMARY:${colors.reset}`)
      discrepancies.integerWithoutSummary.forEach((service) => {
        console.log(`${colors.red}  - "${service}"${colors.reset}`)
        discrepancies.recommendations.push(
          `Run populate-monthly-service-summary.ts to add "${service}" to monthly summary table`,
        )
      })
    }

    if (discrepancies.jsonbWithoutInteger.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}⚠ SERVICES WITH JSONB DATA BUT NO INTEGER DATA:${colors.reset}`)
      discrepancies.jsonbWithoutInteger.forEach((service) => {
        console.log(`${colors.yellow}  - "${service}"${colors.reset}`)
        discrepancies.recommendations.push(`Run service sync to populate integer columns for "${service}"`)
      })
    }

    if (auditResults.jsonbServicesAnalysis.unexpectedServices?.length > 0) {
      console.log(`\n${colors.red}${colors.bold}⚠ INCONSISTENT SERVICE NAMES:${colors.reset}`)
      auditResults.jsonbServicesAnalysis.unexpectedServices.forEach((service) => {
        console.log(`${colors.red}  - JSONB contains "${service}" which doesn't match expected mappings${colors.reset}`)
        discrepancies.inconsistentNames.push(service)
        discrepancies.recommendations.push(`Review and standardize service name "${service}" in JSONB data`)
      })
    }

    if (discrepancies.recommendations.length === 0) {
      console.log(`\n${colors.green}${colors.bold}✓ NO MAJOR DISCREPANCIES FOUND${colors.reset}`)
      console.log(
        `${colors.green}All service data appears consistent across integer columns, JSONB, and monthly summary.${colors.reset}`,
      )
    } else {
      console.log(`\n${colors.bold}RECOMMENDED ACTIONS:${colors.reset}`)
      discrepancies.recommendations.forEach((rec, index) => {
        console.log(`${colors.blue}${index + 1}. ${rec}${colors.reset}`)
      })
    }

    auditResults.discrepancyReport = discrepancies

    // Export results to JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `audit-results-${timestamp}.json`
    writeFileSync(filename, JSON.stringify(auditResults, null, 2))

    console.log(`\n${colors.bold}${colors.green}✓ AUDIT COMPLETE${colors.reset}`)
    console.log(`${colors.blue}Results exported to: ${filename}${colors.reset}`)
  } catch (error) {
    console.error(`${colors.red}${colors.bold}✗ AUDIT FAILED:${colors.reset}`, error)
    process.exit(1)
  }
}

main().catch(console.error)
