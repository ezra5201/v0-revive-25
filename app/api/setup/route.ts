import { NextResponse } from "next/server"
import { isDatabaseInitialized, initializeDatabase, seedDatabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Checking database status...")
    const initialized = await isDatabaseInitialized()

    return NextResponse.json({
      initialized,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Status check failed:", error)
    return NextResponse.json(
      {
        error: "Failed to check database status",
        details: error instanceof Error ? error.message : "Unknown error",
        initialized: false,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("🚀 Starting database setup...")

    // Initialize database tables
    await initializeDatabase()
    console.log("✅ Database tables created")

    // Seed with sample data
    await seedDatabase()
    console.log("✅ Database seeded")

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return NextResponse.json(
      {
        error: "Database setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
