import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Query to list all tables in the public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `

    // Check specifically for intake_forms table
    const intakeFormsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'intake_forms'
      )
    `

    return NextResponse.json({
      tables: tables.map((t) => t.table_name),
      intakeFormsExists: intakeFormsExists[0].exists,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking tables:", error)
    return NextResponse.json(
      {
        error: "Failed to check tables",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
