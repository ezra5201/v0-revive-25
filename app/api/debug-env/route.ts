import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? "Yes" : "No",
      VERCEL_ENV: process.env.VERCEL_ENV,
    }

    return NextResponse.json({ envVars })
  } catch (error) {
    console.error("Error checking environment:", error)
    return NextResponse.json({ error: "Failed to check environment" }, { status: 500 })
  }
}
