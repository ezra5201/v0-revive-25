import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("🚀 Starting database setup...")

    // Check if database is already initialized
    const isAlreadyInitialized =
      await sql`SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'providers')`

    if (isAlreadyInitialized.rows[0].exists) {
      console.log("📊 Database already initialized, skipping setup")
      return NextResponse.json({
        message: "Database is already initialized and contains data.",
        status: "already_initialized",
      })
    }

    // Create providers table
    await sql`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        provider_id INTEGER REFERENCES providers(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        contact_date DATE NOT NULL,
        contact_type VARCHAR(100),
        notes TEXT,
        services_requested TEXT,
        services_provided TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create monthly_service_summary table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_service_summary (
        id SERIAL PRIMARY KEY,
        month_year VARCHAR(7) NOT NULL,
        location VARCHAR(255) NOT NULL,
        provider_name VARCHAR(255) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        total_requested INTEGER DEFAULT 0,
        total_provided INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(month_year, location, provider_name, service_name)
      )
    `

    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert sample providers
    await sql`
      INSERT INTO providers (name, location) VALUES
      ('Community Outreach', 'Downtown'),
      ('Mobile Services', 'Eastside'),
      ('Resource Center', 'Westside')
      ON CONFLICT DO NOTHING
    `

    // Insert sample clients
    const providers = await sql`SELECT id, name, location FROM providers`

    for (const provider of providers.rows) {
      await sql`
        INSERT INTO clients (name, location, provider_id) VALUES
        (${`Client A - ${provider.location}`}, ${provider.location}, ${provider.id}),
        (${`Client B - ${provider.location}`}, ${provider.location}, ${provider.id}),
        (${`Client C - ${provider.location}`}, ${provider.location}, ${provider.id})
        ON CONFLICT DO NOTHING
      `
    }

    // Insert sample contacts
    const clients = await sql`SELECT id FROM clients LIMIT 5`
    const contactTypes = ["Phone Call", "Email", "In-Person", "Text Message"]

    for (const client of clients.rows) {
      for (let i = 0; i < 3; i++) {
        const randomType = contactTypes[Math.floor(Math.random() * contactTypes.length)]
        const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

        await sql`
          INSERT INTO contacts (client_id, contact_date, contact_type, notes)
          VALUES (
            ${client.id}, 
            ${randomDate.toISOString().split("T")[0]}, 
            ${randomType},
            'Sample contact entry'
          )
          ON CONFLICT DO NOTHING
        `
      }
    }

    console.log("✅ Tables verified/created and sample data seeded")

    return NextResponse.json({
      message: "Database initialized successfully with minimal sample data.",
      status: "initialized",
    })
  } catch (error) {
    console.error("❌ Setup failed:", error)
    return NextResponse.json(
      {
        error: `Database setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        status: "error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const isInitialized =
      await sql`SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'providers')`
    return NextResponse.json({
      initialized: isInitialized.rows[0].exists,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Status check failed:", error)
    return NextResponse.json({
      initialized: false,
      error: "Failed to check database status",
    })
  }
}
