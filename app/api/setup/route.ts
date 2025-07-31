import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
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

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ error: "Failed to setup database" }, { status: 500 })
  }
}
