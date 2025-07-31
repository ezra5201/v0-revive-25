import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { clientName } = await request.json()

    if (!clientName) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    await sql`
      UPDATE alerts 
      SET resolved_at = CURRENT_TIMESTAMP 
      WHERE client_name = ${clientName} AND resolved_at IS NULL
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing client alerts:", error)
    return NextResponse.json({ error: "Failed to clear client alerts" }, { status: 500 })
  }
}
