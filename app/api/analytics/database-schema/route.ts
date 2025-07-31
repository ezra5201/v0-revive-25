import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const schema = await sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `

    return NextResponse.json({ schema })
  } catch (error) {
    console.error("Database schema error:", error)
    return NextResponse.json({ schema: [] }, { status: 500 })
  }
}
