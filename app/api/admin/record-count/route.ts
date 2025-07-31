import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`SELECT COUNT(*) as total FROM contacts`
    const count = Number.parseInt(result[0]?.total || "0")

    return NextResponse.json({
      count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Record count error:", error)
    return NextResponse.json({ error: "Failed to get record count" }, { status: 500 })
  }
}
