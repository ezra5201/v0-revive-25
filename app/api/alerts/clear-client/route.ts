import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { clientName } = await request.json()
    const sql = neon(process.env.DATABASE_URL!)

    await sql`DELETE FROM alerts WHERE client_name = ${clientName}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Clear client alerts error:", error)
    return NextResponse.json({ success: false, error: "Failed to clear client alerts" }, { status: 500 })
  }
}
