import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const alertId = Number.parseInt(params.id)

    if (isNaN(alertId)) {
      return NextResponse.json({ success: false, error: "Invalid alert ID" }, { status: 400 })
    }

    // Delete the alert
    const result = await sql`
      DELETE FROM alerts 
      WHERE id = ${alertId}
    `

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    })
  } catch (error) {
    console.error("Delete alert error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete alert",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
