import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { clientName } = await request.json()

    if (!clientName) {
      return NextResponse.json({ success: false, error: "Client name is required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    await sql`DELETE FROM alerts WHERE client_name = ${clientName}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Clear client alerts error:", error)
    return NextResponse.json({ success: false, error: "Failed to clear client alerts" }, { status: 500 })
  }
}
