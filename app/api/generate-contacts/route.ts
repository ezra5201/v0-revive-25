import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sqlClient = neon(process.env.DATABASE_URL!)
const sql = neon(process.env.DATABASE_URL!)

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
  "Housing Assistance",
  "Food Services",
  "Healthcare Navigation",
  "Employment Support",
  "Mental Health Services",
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
  "Community Outreach",
  "Mobile Services",
  "Resource Center",
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

const locations = ["Downtown", "Eastside", "Westside", "Northside", "Southside"]

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

export async function POST(request: Request) {
  try {
    const { count = 10, startDate, endDate } = await request.json()

    // Get all clients
    const clients = await sqlClient`
      SELECT id, name FROM clients
    `

    const contactTypes = ["Phone Call", "Email", "In-Person", "Text Message"]
    const generatedContacts = []

    if (clients.length === 0) {
      for (let i = 0; i < count; i++) {
        const clientName = `Generated Client ${Date.now()}-${i}`
        const provider = getRandomElement(providers)
        const location = getRandomElement(locations)

        // Random date within last 30 days
        const randomDate = new Date()
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30))

        const selectedServices = services.slice(0, Math.floor(Math.random() * 3) + 1)

        const contact = await sql`
          INSERT INTO contacts (client_name, contact_date, provider_name, location, services_requested, services_provided)
          VALUES (
            ${clientName}, 
            ${randomDate.toISOString().split("T")[0]}, 
            ${provider}, 
            ${location},
            ${selectedServices.join(", ")},
            ${selectedServices.slice(0, Math.floor(Math.random() * selectedServices.length) + 1).join(", ")}
          )
          RETURNING id
        `

        generatedContacts.push(contact[0])
      }
    } else {
      for (let i = 0; i < count; i++) {
        const randomClient = clients[Math.floor(Math.random() * clients.length)]
        const randomType = contactTypes[Math.floor(Math.random() * contactTypes.length)]

        // Generate random date between startDate and endDate (or last 30 days)
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const end = endDate ? new Date(endDate) : new Date()
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

        const contact = await sqlClient`
          INSERT INTO contacts (client_id, contact_date, contact_type, notes)
          VALUES (
            ${randomClient.id}, 
            ${randomDate.toISOString().split("T")[0]}, 
            ${randomType},
            'Generated contact for testing'
          )
          RETURNING *
        `

        generatedContacts.push(contact[0])
      }
    }

    return NextResponse.json({
      success: true,
      generated: generatedContacts.length,
      message: `Generated ${generatedContacts.length} contacts`,
    })
  } catch (error) {
    console.error("Generate contacts error:", error)
    return NextResponse.json({ error: "Failed to generate contacts" }, { status: 500 })
  }
}
