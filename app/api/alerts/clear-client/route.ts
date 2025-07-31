import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 })
    }

    // Clear all alerts for the client
    const result = await sql`
      DELETE FROM alerts 
      WHERE client_id = ${clientId}
    `

    return NextResponse.json({
      success: true,
      message: "Client alerts cleared successfully",
    })
  } catch (error) {
    console.error("Clear client alerts error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear client alerts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
