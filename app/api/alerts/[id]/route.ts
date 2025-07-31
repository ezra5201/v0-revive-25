import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const alertId = params.id

    // Delete the alert
    await sql`
      DELETE FROM alerts 
      WHERE id = ${alertId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 })
  }
}
