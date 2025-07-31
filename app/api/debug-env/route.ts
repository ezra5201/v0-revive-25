import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "Not set",
      POSTGRES_URL: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 50) + "..." : "undefined",
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL
        ? process.env.POSTGRES_PRISMA_URL.substring(0, 50) + "..."
        : "undefined",
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING
        ? process.env.POSTGRES_URL_NON_POOLING.substring(0, 50) + "..."
        : "undefined",
      POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL
        ? process.env.POSTGRES_URL_NO_SSL.substring(0, 50) + "..."
        : "undefined",
      hasProblematicVars: {
        DATABASE_URL_has_psql: process.env.DATABASE_URL?.includes("psql") || false,
        POSTGRES_URL_has_psql: process.env.POSTGRES_URL?.includes("psql") || false,
        POSTGRES_PRISMA_URL_has_psql: process.env.POSTGRES_PRISMA_URL?.includes("psql") || false,
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL: process.env.VERCEL ? "true" : "false",
      timestamp: new Date().toISOString(),
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }

    return NextResponse.json({ success: true, env: envVars })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get environment variables",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
