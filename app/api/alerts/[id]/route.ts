import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const alertId = Number.parseInt(params.id)

    await sql`DELETE FROM alerts WHERE id = ${alertId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete alert error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete alert" }, { status: 500 })
  }
}
