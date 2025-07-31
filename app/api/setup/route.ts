import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        provider_name VARCHAR(255),
        service_type VARCHAR(100),
        contact_date DATE,
        notes TEXT,
        service_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create monthly_service_summary table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_service_summary (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        service_name VARCHAR(100) NOT NULL,
        total_requested INTEGER DEFAULT 0,
        total_provided INTEGER DEFAULT 0,
        completion_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, month, service_name)
      )
    `

    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        client_name VARCHAR(255),
        severity VARCHAR(20) DEFAULT 'medium',
        resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ success: false, error: "Failed to setup database" }, { status: 500 })
  }
}
