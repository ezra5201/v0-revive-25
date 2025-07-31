import { getDatabaseStats } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stats = await getDatabaseStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to get database stats:", error)
    return NextResponse.json({ error: "Failed to retrieve database statistics" }, { status: 500 })
  }
}
