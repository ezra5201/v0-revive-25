import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_date DATE NOT NULL,
        services TEXT,
        provider VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create monthly_service_summary table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_service_summary (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        shower INTEGER DEFAULT 0,
        laundry INTEGER DEFAULT 0,
        meal INTEGER DEFAULT 0,
        clothing INTEGER DEFAULT 0,
        mail INTEGER DEFAULT 0,
        phone INTEGER DEFAULT 0,
        computer INTEGER DEFAULT 0,
        case_management INTEGER DEFAULT 0,
        benefits INTEGER DEFAULT 0,
        housing INTEGER DEFAULT 0,
        medical INTEGER DEFAULT 0,
        mental_health INTEGER DEFAULT 0,
        substance_abuse INTEGER DEFAULT 0,
        legal INTEGER DEFAULT 0,
        transportation INTEGER DEFAULT 0,
        id_docs INTEGER DEFAULT 0,
        storage INTEGER DEFAULT 0,
        other INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_name, month, year)
      )
    `

    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255),
        alert_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name)`
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_date ON contacts(contact_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_provider ON contacts(provider)`
    await sql`CREATE INDEX IF NOT EXISTS idx_summary_client_date ON monthly_service_summary(client_name, year, month)`
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved)`

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ success: false, error: "Failed to setup database" }, { status: 500 })
  }
}
