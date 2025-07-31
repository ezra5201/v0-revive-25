import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "undefined",
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
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString(),
      hasDbUrl: !!process.env.DATABASE_URL,
    }

    return NextResponse.json(envVars)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get environment variables",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
