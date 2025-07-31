import { initializeDatabase, seedDatabase, isDatabaseInitialized } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Starting database setup...")

    const isAlreadyInitialized = await isDatabaseInitialized()

    if (isAlreadyInitialized) {
      console.log("📊 Database already initialized, skipping setup")
      return NextResponse.json({
        message: "Database is already initialized and contains data.",
        status: "already_initialized",
      })
    }

    await initializeDatabase()
    console.log("✅ Tables verified/created")

    await seedDatabase()
    console.log("✅ Minimal data seeded")

    return NextResponse.json({
      message: "Database initialized successfully with minimal sample data.",
      status: "initialized",
    })
  } catch (error) {
    console.error("❌ Setup failed:", error)
    return NextResponse.json(
      {
        error: `Database setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        status: "error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const isInitialized = await isDatabaseInitialized()
    return NextResponse.json({
      initialized: isInitialized,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Status check failed:", error)
    return NextResponse.json({
      initialized: false,
      error: "Failed to check database status",
    })
  }
}
