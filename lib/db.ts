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
  if (!sql) {
    return false
  }

  try {
    const tablesCheck = await sql`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'contacts') as contacts_table,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'clients') as clients_table,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'providers') as providers_table
    `

    const tables = tablesCheck[0]
    if (tables.contacts_table === 0 || tables.clients_table === 0 || tables.providers_table === 0) {
      return false
    }

    const dataCheck = await sql`
      SELECT 
        (SELECT COUNT(*) FROM contacts) as contact_count,
        (SELECT COUNT(*) FROM clients) as client_count,
        (SELECT COUNT(*) FROM providers) as provider_count
    `

    const data = dataCheck[0]
    return data.contact_count > 0 && data.client_count > 0 && data.provider_count > 0
  } catch (error) {
    console.error("Database initialization check failed:", error)
    return false
  }
}

export async function initializeDatabase(): Promise<boolean> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    console.log("🔍 Checking database tables...")

    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        contact_date DATE NOT NULL,
        days_ago INTEGER NOT NULL,
        provider_name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        food_accessed BOOLEAN DEFAULT FALSE,
        services_requested TEXT,
        services_provided TEXT,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("✅ Database tables verified/created")
    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

export async function seedDatabase(): Promise<boolean> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    console.log("🌱 Checking if seeding is needed...")

    const existingData = await sql`
      SELECT 
        (SELECT COUNT(*) FROM providers) as provider_count,
        (SELECT COUNT(*) FROM clients) as client_count,
        (SELECT COUNT(*) FROM contacts) as contact_count
    `

    const counts = existingData[0]

    if (counts.provider_count > 0 && counts.client_count > 0 && counts.contact_count > 0) {
      console.log("📊 Database already contains data, skipping seed")
      return true
    }

    console.log("🌱 Seeding minimal data...")

    if (counts.provider_count === 0) {
      const providers = [
        "Elena Ahmed",
        "Sofia Cohen",
        "Jamal Silva",
        "Mohammed Ahmed",
        "Sonia Singh",
        "Leila Garcia",
        "Andrea Leflore",
      ]

      for (const provider of providers) {
        await sql`INSERT INTO providers (name) VALUES (${provider}) ON CONFLICT (name) DO NOTHING`
      }
      console.log("✅ Providers seeded")
    }

    if (counts.client_count === 0) {
      const existingNames = new Set<string>()
      const maleCount = 7
      const femaleCount = 4
      const clientNames: string[] = []

      for (let i = 0; i < maleCount; i++) {
        clientNames.push(generateUniqueName(existingNames, true))
      }
      for (let i = 0; i < femaleCount; i++) {
        clientNames.push(generateUniqueName(existingNames, false))
      }

      for (let i = clientNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[clientNames[i], clientNames[j]] = [clientNames[j], clientNames[i]]
      }

      const categories = ["Client", "Prospect", ...Array(9).fill("Client")]

      for (let i = 0; i < clientNames.length; i++) {
        await sql`INSERT INTO clients (name, category) VALUES (${clientNames[i]}, ${categories[i]}) ON CONFLICT (name) DO NOTHING`
      }
      console.log("✅ Clients seeded")
    }

    if (counts.contact_count === 0) {
      const clients = await sql`SELECT name FROM clients ORDER BY name`
      const contacts = [
        { date: "2025-01-16", days: 0, provider: "Elena Ahmed", category: "Client", food: false },
        { date: "2025-01-15", days: 1, provider: "Sofia Cohen", category: "Client", food: true },
        { date: "2025-01-14", days: 2, provider: "Jamal Silva", category: "Client", food: false },
        { date: "2025-01-13", days: 3, provider: "Mohammed Ahmed", category: "Prospect", food: false },
        { date: "2025-01-12", days: 4, provider: "Sonia Singh", category: "Client", food: true },
      ]

      for (let i = 0; i < Math.min(contacts.length, clients.length); i++) {
        const contact = contacts[i]
        const client = clients[i]

        await sql`
          INSERT INTO contacts (contact_date, days_ago, provider_name, client_name, category, food_accessed)
          VALUES (${contact.date}, ${contact.days}, ${contact.provider}, ${client.name}, ${contact.category}, ${contact.food})
        `
      }
      console.log("✅ Sample contacts seeded")
    }

    console.log("✅ Database seeded successfully")
    return true
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    throw error
  }
}

export async function getDatabaseStats() {
  if (!sql) {
    throw new Error("Database connection not available")
  }

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
      contacts: Number(basicStats[0].contacts),
      clients: Number(basicStats[0].clients),
      providers: Number(basicStats[0].providers),
      alerts: Number(basicStats[0].alerts),
      unique_people: Number(uniquePeople[0].unique_people),
      master_records_gap: Number(masterRecordsGap[0].gap),
      data_consistency_percentage: dataConsistencyPercentage,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to get database stats:", error)
    throw error
  }
}
