import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Fix future dates by setting them to today
    const result = await sql`
      UPDATE contacts 
      SET contact_date = ${today}
      WHERE contact_date > ${today}
    `

    return NextResponse.json({
      success: true,
      message: "Fixed future dates successfully",
    })
  } catch (error) {
    console.error("Emergency fix error:", error)
    return NextResponse.json({ error: "Failed to fix future dates" }, { status: 500 })
  }
}
