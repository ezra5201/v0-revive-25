import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Service options
const services = [
  "Case Management",
  "Employment",
  "Food",
  "Healthcare",
  "Housing",
  "ID",
  "Laundry",
  "Occupational",
  "Recreation",
  "Other",
]

// Provider names for CM and OT services
const providers = [
  "Elena Ahmed",
  "Sofia Cohen",
  "Jamal Silva",
  "Mohammed Ahmed",
  "Sonia Singh",
  "Leila Garcia",
  "Andrea Leflore",
]

// Holiday periods for seasonal clustering (month-day format)
const holidayPeriods = [
  { start: { month: 11, day: 20 }, end: { month: 12, day: 5 }, name: "Thanksgiving/Christmas" },
  { start: { month: 12, day: 20 }, end: { month: 1, day: 10 }, name: "Christmas/New Year" },
  { start: { month: 3, day: 15 }, end: { month: 4, day: 5 }, name: "Easter/Spring" },
  { start: { month: 6, day: 15 }, end: { month: 7, day: 15 }, name: "Summer" },
  { start: { month: 9, day: 1 }, end: { month: 9, day: 15 }, name: "Back to School" },
]

// Sample comments for realistic interactions
const sampleComments = [
  "Client was in good spirits today.",
  "Discussed housing options and next steps.",
  "Client expressed interest in job training programs.",
  "Provided information about healthcare resources.",
  "Client seemed stressed but engaged well.",
  "Follow-up needed on documentation.",
  "Client reported positive progress this week.",
  "Discussed family situation and support needs.",
  "Client was punctual and prepared for meeting.",
  "Provided referral to mental health services.",
  "Client expressed gratitude for ongoing support.",
  "Discussed transportation challenges.",
  "Client showed improvement in self-advocacy.",
  "Reviewed goals and updated action plan.",
  "Client requested additional resources.",
  "Discussed budgeting and financial planning.",
  "Client was receptive to feedback.",
  "Provided encouragement and motivation.",
  "Client shared recent accomplishments.",
  "Discussed conflict resolution strategies.",
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomElements<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function isHolidayPeriod(date: Date): boolean {
  const month = date.getMonth() + 1 // JavaScript months are 0-indexed
  const day = date.getDate()

  return holidayPeriods.some((period) => {
    // Handle year-crossing periods (like Christmas/New Year)
    if (period.start.month > period.end.month) {
      return (
        (month >= period.start.month && day >= period.start.day) || (month <= period.end.month && day <= period.end.day)
      )
    } else {
      return (
        month >= period.start.month && month <= period.end.month && day >= period.start.day && day <= period.end.day
      )
    }
  })
}

function generateRandomDate(startYear: number, endYear: number): Date {
  // Current date is 06/30/2025 - this is our absolute maximum
  const maxAllowedDate = new Date(2025, 5, 30) // June 30, 2025 (month is 0-indexed)

  let start: Date
  let end: Date

  if (startYear === 2025) {
    // For 2025, start from Jan 1, 2025 and end at June 30, 2025
    start = new Date(2025, 0, 1) // January 1, 2025
    end = maxAllowedDate
  } else {
    // For other years, use the full year
    start = new Date(startYear, 0, 1)
    end = new Date(endYear, 11, 31)

    // But still cap at maxAllowedDate if needed
    if (end > maxAllowedDate) {
      end = maxAllowedDate
    }
  }

  // Make sure start date is not after end date
  if (start > end) {
    return end
  }

  // 30% chance for holiday clustering
  if (Math.random() < 0.3) {
    // Try up to 10 times to get a holiday period date
    for (let i = 0; i < 10; i++) {
      const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
      const date = new Date(randomTime)
      if (isHolidayPeriod(date) && date <= maxAllowedDate) {
        return date
      }
    }
  }

  // Regular random date (ensuring it's not after 06/30/2025)
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  const date = new Date(randomTime)
  return date <= maxAllowedDate ? date : maxAllowedDate
}

function generateServicesProvided(servicesRequested: string[]): any[] {
  const provided: any[] = []

  // 60% chance to add MORE services than requested
  const shouldAddMore = Math.random() < 0.6
  let servicesToProvide = [...servicesRequested]

  if (shouldAddMore) {
    // Add 1-3 additional services
    const additionalCount = Math.floor(Math.random() * 3) + 1
    const availableServices = services.filter((s) => !servicesToProvide.includes(s))
    const additionalServices = getRandomElements(
      availableServices,
      0,
      Math.min(additionalCount, availableServices.length),
    )
    servicesToProvide = [...servicesToProvide, ...additionalServices]
  }

  // Provide 60-80% of the services (but at least 1 if any were requested)
  const provisionRate = 0.6 + Math.random() * 0.2 // 60-80%
  const countToProvide = Math.max(1, Math.floor(servicesToProvide.length * provisionRate))
  const servicesToActuallyProvide = getRandomElements(servicesToProvide, countToProvide, countToProvide)

  servicesToActuallyProvide.forEach((service) => {
    const serviceRecord: any = {
      service,
      completedAt: new Date().toISOString(),
    }

    // Add provider for CM and OT services
    if (service === "Case Management" || service === "Occupational") {
      serviceRecord.provider = getRandomElement(providers)
    }

    provided.push(serviceRecord)
  })

  return provided
}

// Fixed bulk insert function using sql.query()
function buildBulkInsert(batch: any[]) {
  const cols = [
    "contact_date",
    "days_ago",
    "provider_name",
    "client_name",
    "category",
    "services_requested",
    "services_provided",
    "comments",
    "food_accessed",
    "created_at",
    "updated_at",
  ]

  const placeholders: string[] = []
  const values: any[] = []
  const nowIso = new Date().toISOString()

  batch.forEach((c, idx) => {
    const base = idx * cols.length
    placeholders.push(
      `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${
        base + 9
      },$${base + 10},$${base + 11})`,
    )
    values.push(
      c.contact_date,
      c.days_ago,
      "System Generated",
      c.client_name,
      c.category,
      c.services_requested,
      c.services_provided,
      c.comments,
      c.food_accessed,
      nowIso,
      nowIso,
    )
  })

  const query = `
    INSERT INTO contacts (${cols.join(", ")})
    VALUES ${placeholders.join(",")}
  `
  return { query, values }
}

export async function POST() {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    console.log("Starting generation of 1000 contact records...")

    // Get existing clients (not prospects)
    const existingClients = await sql`
      SELECT name FROM clients WHERE category = 'Client' ORDER BY name
    `

    if (existingClients.length === 0) {
      return NextResponse.json(
        { error: "No existing clients found. Please ensure you have clients in the database." },
        { status: 400 },
      )
    }

    console.log(`Found ${existingClients.length} existing clients`)

    const contactsToCreate = []
    // Today is 06/30/2025
    const today = new Date(2025, 5, 30) // June 30, 2025
    today.setHours(0, 0, 0, 0)

    // 1. Generate 40 contacts for today (06/30/2025)
    console.log("Generating 40 contacts for today (06/30/2025)...")
    for (let i = 0; i < 40; i++) {
      const client = getRandomElement(existingClients)
      const servicesRequested = getRandomElements(services, 1, 4)
      const servicesProvided = generateServicesProvided(servicesRequested)
      const hasComment = Math.random() < 0.3

      contactsToCreate.push({
        contact_date: today.toISOString().split("T")[0],
        days_ago: 0,
        client_name: client.name,
        category: "Client",
        services_requested: JSON.stringify(servicesRequested),
        services_provided: JSON.stringify(servicesProvided),
        comments: hasComment ? getRandomElement(sampleComments) : "",
        food_accessed: servicesProvided.some((s: any) => s.service === "Food"),
      })
    }

    // 2. Generate 384 contacts for 2025 (January 1 - June 30, 2025)
    console.log("Generating 384 contacts for 2025 (Jan 1 - June 30, 2025)...")
    for (let i = 0; i < 384; i++) {
      const client = getRandomElement(existingClients)
      const contactDate = generateRandomDate(2025, 2025)
      const daysAgo = Math.floor((today.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24))
      const servicesRequested = getRandomElements(services, 1, 4)
      const servicesProvided = generateServicesProvided(servicesRequested)
      const hasComment = Math.random() < 0.3

      contactsToCreate.push({
        contact_date: contactDate.toISOString().split("T")[0],
        days_ago: Math.abs(daysAgo),
        client_name: client.name,
        category: "Client",
        services_requested: JSON.stringify(servicesRequested),
        services_provided: JSON.stringify(servicesProvided),
        comments: hasComment ? getRandomElement(sampleComments) : "",
        food_accessed: servicesProvided.some((s: any) => s.service === "Food"),
      })
    }

    // 3. Generate 576 contacts for 2024-2021
    console.log("Generating 576 contacts for 2024-2021...")
    for (let i = 0; i < 576; i++) {
      const client = getRandomElement(existingClients)
      const contactDate = generateRandomDate(2021, 2024)
      const daysAgo = Math.floor((today.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24))
      const servicesRequested = getRandomElements(services, 1, 4)
      const servicesProvided = generateServicesProvided(servicesRequested)
      const hasComment = Math.random() < 0.3

      contactsToCreate.push({
        contact_date: contactDate.toISOString().split("T")[0],
        days_ago: daysAgo,
        client_name: client.name,
        category: "Client",
        services_requested: JSON.stringify(servicesRequested),
        services_provided: JSON.stringify(servicesProvided),
        comments: hasComment ? getRandomElement(sampleComments) : "",
        food_accessed: servicesProvided.some((s: any) => s.service === "Food"),
      })
    }

    console.log(`Generated ${contactsToCreate.length} contact records. Inserting into database...`)

    // Insert contacts using sql.query() for parameterized queries
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < contactsToCreate.length; i += batchSize) {
      const batch = contactsToCreate.slice(i, i + batchSize)
      const { query, values } = buildBulkInsert(batch)

      // Use sql.query() for parameterized queries
      await sql.query(query, values)

      inserted += batch.length
      console.log(`Inserted ${inserted}/${contactsToCreate.length} contacts...`)
    }

    // Get statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(DISTINCT client_name) as unique_clients,
        AVG(CASE WHEN comments != '' THEN 1.0 ELSE 0.0 END) * 100 as comment_percentage
      FROM contacts
    `

    const yearStats = await sql`
      SELECT 
        EXTRACT(YEAR FROM contact_date) as year,
        COUNT(*) as count
      FROM contacts
      GROUP BY EXTRACT(YEAR FROM contact_date)
      ORDER BY year DESC
    `

    return NextResponse.json({
      message: "Successfully generated 1000 contact records!",
      statistics: {
        totalContacts: stats[0].total_contacts,
        uniqueClients: stats[0].unique_clients,
        commentPercentage: Math.round(stats[0].comment_percentage),
        yearBreakdown: yearStats.map((stat: any) => ({
          year: stat.year,
          count: stat.count,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to generate contacts:", error)
    return NextResponse.json(
      { error: `Failed to generate contacts: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
