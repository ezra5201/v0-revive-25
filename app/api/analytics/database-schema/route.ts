import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get all columns from the contacts table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'contacts'
      ORDER BY ordinal_position
    `

    // Get a sample of data to understand the structure
    const sampleData = await sql`
      SELECT *
      FROM contacts
      LIMIT 3
    `

    // Check for service-related columns specifically
    const serviceColumns = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'contacts'
      AND (column_name LIKE '%_requested' OR column_name LIKE '%_provided')
      ORDER BY column_name
    `

    return NextResponse.json({
      totalColumns: columns.length,
      columns: columns.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === "YES",
      })),
      serviceColumns: serviceColumns.map((col) => col.column_name),
      sampleDataCount: sampleData.length,
      sampleData: sampleData.map((row) => {
        // Only return a subset of fields for privacy
        return {
          id: row.id,
          contact_date: row.contact_date,
          provider_name: row.provider_name,
          category: row.category,
          food_requested: row.food_requested,
          food_provided: row.food_provided,
          // Add a few more service examples
          housing_requested: row.housing_requested,
          housing_provided: row.housing_provided,
        }
      }),
    })
  } catch (error) {
    console.error("Database schema check failed:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database schema",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
