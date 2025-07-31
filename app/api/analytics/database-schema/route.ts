import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get table information
    const tables = await sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `

    // Group columns by table
    const schema = tables.reduce((acc: any, row: any) => {
      if (!acc[row.table_name]) {
        acc[row.table_name] = []
      }
      acc[row.table_name].push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === "YES",
        default: row.column_default,
      })
      return acc
    }, {})

    return NextResponse.json({ schema })
  } catch (error) {
    console.error("Error fetching database schema:", error)
    return NextResponse.json({ error: "Failed to fetch database schema" }, { status: 500 })
  }
}
