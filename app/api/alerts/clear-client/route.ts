import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { clientName } = await request.json()

    if (!clientName) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    // Clear all alerts for this client
    await sql`
      DELETE FROM alerts 
      WHERE client_name = ${clientName}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing client alerts:", error)
    return NextResponse.json({ error: "Failed to clear client alerts" }, { status: 500 })
  }
}
