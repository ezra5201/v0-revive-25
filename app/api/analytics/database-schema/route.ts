import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get table information
    const tables = await sql`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Get column information for each table
    const schema = {}

    for (const table of tables) {
      const columns = await sql`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `

      schema[table.table_name] = {
        type: table.table_type,
        columns,
      }
    }

    return NextResponse.json({
      success: true,
      schema,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database schema error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch database schema",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
