import { neon } from "@neondatabase/serverless"

// Function to clean connection strings that might have psql wrapper
function cleanConnectionString(connectionString: string): string {
  if (!connectionString) return connectionString

  // Remove psql command wrapper if present
  const psqlPattern = /^psql\s+'(.+)'$/
  const match = connectionString.match(psqlPattern)

  if (match) {
    console.log("🧹 Cleaned psql wrapper from connection string")
    return match[1] // Return the URL without the psql wrapper
  }

  return connectionString
}

// Get the connection string with fallbacks
const rawConnectionString =
  process.env.DATABASE_URL_OVERRIDE ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL_NO_SSL ||
  ""

// Clean the connection string
const connectionString = cleanConnectionString(rawConnectionString)

if (!connectionString) {
  throw new Error("No database connection string found in environment variables")
}

// Validate that it's a proper PostgreSQL URL
if (!connectionString.startsWith("postgresql://") && !connectionString.startsWith("postgres://")) {
  throw new Error(
    `Invalid database connection string format. Expected postgresql:// or postgres://, got: ${connectionString.substring(0, 20)}...`,
  )
}

// Create the SQL client
export const sql = neon(connectionString)

// Export the connection string for debugging
export const debugConnectionString = connectionString.substring(0, 50) + "..."

// Debug logging to see what we're actually getting
console.log("🔍 Database connection debug:")
console.log("DATABASE_URL_OVERRIDE exists:", !!process.env.DATABASE_URL_OVERRIDE)
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)
console.log("POSTGRES_URL exists:", !!process.env.POSTGRES_URL)
console.log("POSTGRES_PRISMA_URL exists:", !!process.env.POSTGRES_PRISMA_URL)
console.log("POSTGRES_URL_NON_POOLING exists:", !!process.env.POSTGRES_URL_NON_POOLING)
console.log("POSTGRES_URL_NO_SSL exists:", !!process.env.POSTGRES_URL_NO_SSL)
console.log("Connection string length:", connectionString.length)
console.log("Connection string preview:", debugConnectionString)

// Check for problematic environment variables
if (process.env.POSTGRES_URL && process.env.POSTGRES_URL.includes("psql")) {
  console.warn("⚠️ POSTGRES_URL contains psql prefix:", process.env.POSTGRES_URL.substring(0, 50))
}
if (process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_PRISMA_URL.includes("psql")) {
  console.warn("⚠️ POSTGRES_PRISMA_URL contains psql prefix:", process.env.POSTGRES_PRISMA_URL.substring(0, 50))
}

// Detect whether we have a plausible Postgres URL
const isPostgresUrl = connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://")

// Log which database branch is being used
if (isPostgresUrl && connectionString) {
  // Extract branch info from connection string
  const urlParts = connectionString.match(/postgres(?:ql)?:\/\/[^@]+@([^/]+)\/([^?]+)/)
  if (urlParts) {
    const host = urlParts[1]
    const database = urlParts[2]
    console.log(`🔗 Connected to Neon database: ${database} on ${host}`)

    // The host usually contains branch info like: ep-branch-name-12345.us-east-1.aws.neon.tech
    const branchMatch = host.match(/ep-([^-]+(?:-[^-]+)*)-\d+/)
    if (branchMatch) {
      console.log(`🌿 Neon branch: ${branchMatch[1]}`)
    }
  }
}

const maleFirstNames = [
  "James",
  "Robert",
  "John",
  "Michael",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Christopher",
  "Charles",
  "Daniel",
  "Matthew",
  "Anthony",
  "Mark",
  "Donald",
  "Steven",
  "Paul",
  "Andrew",
  "Joshua",
  "Kenneth",
  "Kevin",
  "Brian",
  "George",
  "Timothy",
  "Ronald",
  "Jason",
  "Edward",
  "Jeffrey",
  "Ryan",
]

const femaleFirstNames = [
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
  "Lisa",
  "Nancy",
  "Betty",
  "Helen",
  "Sandra",
  "Donna",
  "Carol",
  "Ruth",
  "Sharon",
  "Michelle",
  "Laura",
  "Amy",
  "Kathleen",
  "Angela",
  "Shirley",
  "Emma",
  "Brenda",
  "Olivia",
  "Cynthia",
  "Marie",
]

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
]

function generateUniqueName(existingNames: Set<string>, isMale: boolean): string {
  const firstNames = isMale ? maleFirstNames : femaleFirstNames
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName}`

    if (!existingNames.has(fullName)) {
      existingNames.add(fullName)
      return fullName
    }
    attempts++
  }

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  let counter = 1
  let fullName = `${firstName} ${lastName}`

  while (existingNames.has(fullName)) {
    fullName = `${firstName} ${lastName} ${counter}`
    counter++
  }

  existingNames.add(fullName)
  return fullName
}

export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    // Check if contacts table exists and has data
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      ) as table_exists
    `

    if (!result[0]?.table_exists) {
      return false
    }

    // Check if we have any data
    const dataCheck = await sql`SELECT COUNT(*) as count FROM contacts`
    return Number.parseInt(dataCheck[0]?.count || "0") > 0
  } catch (error) {
    console.error("Database initialization check failed:", error)
    return false
  }
}

export async function initializeDatabase() {
  try {
    console.log("🔧 Creating database tables...")

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        contact_date DATE NOT NULL,
        provider_name VARCHAR(255),
        location VARCHAR(255),
        services_requested TEXT,
        services_provided TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        first_contact_date DATE,
        last_contact_date DATE,
        total_contacts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create providers table
    await sql`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create monthly_service_summary table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_service_summary (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        total_requested INTEGER DEFAULT 0,
        total_provided INTEGER DEFAULT 0,
        completion_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, month, service_name)
      )
    `

    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        alert_type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_client_name ON contacts(client_name)`
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_date ON contacts(contact_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_provider ON contacts(provider_name)`
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_summary_date ON monthly_service_summary(year, month)`
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_client ON alerts(client_name)`

    console.log("✅ Database tables created successfully")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with sample data...")

    // Sample providers and locations
    const providers = ["Community Outreach", "Mobile Services", "Resource Center"]
    const locations = ["Downtown", "Eastside", "Westside", "Northside", "Southside"]
    const services = [
      "Housing Assistance",
      "Food Services",
      "Healthcare Navigation",
      "Employment Support",
      "Mental Health Services",
      "Substance Abuse Counseling",
      "Legal Aid",
      "Transportation",
    ]

    // Insert providers first
    for (const provider of providers) {
      await sql`
        INSERT INTO providers (name) 
        VALUES (${provider})
        ON CONFLICT (name) DO NOTHING
      `
    }

    // Generate sample contacts
    const sampleContacts = []
    const clientNames = [
      "John Smith",
      "Maria Garcia",
      "David Johnson",
      "Sarah Wilson",
      "Michael Brown",
      "Lisa Davis",
      "Robert Miller",
      "Jennifer Taylor",
      "William Anderson",
      "Jessica Thomas",
    ]

    for (let i = 0; i < 50; i++) {
      const clientName = clientNames[Math.floor(Math.random() * clientNames.length)]
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]

      // Generate random date within last 30 days
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30))

      // Random services
      const numServices = Math.floor(Math.random() * 3) + 1
      const selectedServices = []
      for (let j = 0; j < numServices; j++) {
        const service = services[Math.floor(Math.random() * services.length)]
        if (!selectedServices.includes(service)) {
          selectedServices.push(service)
        }
      }

      sampleContacts.push({
        client_name: clientName,
        contact_date: randomDate.toISOString().split("T")[0],
        provider_name: provider,
        location: location,
        services_requested: selectedServices.join(", "),
        services_provided: selectedServices
          .slice(0, Math.floor(Math.random() * selectedServices.length) + 1)
          .join(", "),
      })
    }

    // Insert sample contacts
    for (const contact of sampleContacts) {
      await sql`
        INSERT INTO contacts (client_name, contact_date, provider_name, location, services_requested, services_provided)
        VALUES (${contact.client_name}, ${contact.contact_date}, ${contact.provider_name}, ${contact.location}, ${contact.services_requested}, ${contact.services_provided})
      `
    }

    // Update clients table with aggregated data
    await sql`
      INSERT INTO clients (name, first_contact_date, last_contact_date, total_contacts)
      SELECT 
        client_name,
        MIN(contact_date) as first_contact_date,
        MAX(contact_date) as last_contact_date,
        COUNT(*) as total_contacts
      FROM contacts
      GROUP BY client_name
      ON CONFLICT (name) DO UPDATE SET
        first_contact_date = EXCLUDED.first_contact_date,
        last_contact_date = EXCLUDED.last_contact_date,
        total_contacts = EXCLUDED.total_contacts
    `

    console.log("✅ Database seeded successfully")
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    throw error
  }
}

export async function getDatabaseStats() {
  try {
    // Get basic counts
    const basicStats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM contacts) as contacts,
        (SELECT COUNT(*) FROM clients) as clients,
        (SELECT COUNT(DISTINCT name) FROM providers) as providers,
        (SELECT COUNT(*) FROM alerts WHERE is_read = FALSE) as alerts
    `

    // Get unique people count (distinct client names from contacts)
    const uniquePeople = await sql`
      SELECT COUNT(DISTINCT client_name) as unique_people
      FROM contacts
    `

    // Calculate master records gap
    const masterRecordsGap = await sql`
      SELECT 
        (SELECT COUNT(DISTINCT client_name) FROM contacts) - 
        (SELECT COUNT(*) FROM clients) as gap
    `

    // Calculate data consistency percentage
    const consistencyCheck = await sql`
      SELECT 
        COUNT(DISTINCT c.client_name) as contacts_clients,
        (SELECT COUNT(*) FROM clients) as master_clients
      FROM contacts c
    `

    const consistency = consistencyCheck[0]
    const dataConsistencyPercentage =
      consistency.master_clients > 0 ? Math.round((consistency.master_clients / consistency.contacts_clients) * 100) : 0

    return {
      contacts: Number(basicStats[0].contacts) || 0,
      clients: Number(basicStats[0].clients) || 0,
      providers: Number(basicStats[0].providers) || 0,
      alerts: Number(basicStats[0].alerts) || 0,
      unique_people: Number(uniquePeople[0].unique_people) || 0,
      master_records_gap: Number(masterRecordsGap[0].gap) || 0,
      data_consistency_percentage: dataConsistencyPercentage || 0,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to get database stats:", error)
    throw error
  }
}
