import { NextResponse } from "next/server"

export async function GET() {
  const safeSubstring = (str: string | undefined, length = 50) => {
    if (!str) return "undefined"
    return str.substring(0, length) + (str.length > length ? "..." : "")
  }

  return NextResponse.json({
    environmentVariables: {
      DATABASE_URL: safeSubstring(process.env.DATABASE_URL),
      POSTGRES_URL: safeSubstring(process.env.POSTGRES_URL),
      POSTGRES_PRISMA_URL: safeSubstring(process.env.POSTGRES_PRISMA_URL),
      POSTGRES_URL_NON_POOLING: safeSubstring(process.env.POSTGRES_URL_NON_POOLING),
      POSTGRES_URL_NO_SSL: safeSubstring(process.env.POSTGRES_URL_NO_SSL),
      DATABASE_URL_OVERRIDE: safeSubstring(process.env.DATABASE_URL_OVERRIDE),
    },
    problematicVariables: {
      DATABASE_URL_has_psql: process.env.DATABASE_URL?.includes("psql") || false,
      POSTGRES_URL_has_psql: process.env.POSTGRES_URL?.includes("psql") || false,
      POSTGRES_PRISMA_URL_has_psql: process.env.POSTGRES_PRISMA_URL?.includes("psql") || false,
      POSTGRES_URL_NON_POOLING_has_psql: process.env.POSTGRES_URL_NON_POOLING?.includes("psql") || false,
      POSTGRES_URL_NO_SSL_has_psql: process.env.POSTGRES_URL_NO_SSL?.includes("psql") || false,
    },
    summary: {
      totalEnvVars: Object.keys(process.env).length,
      databaseEnvVarsFound: [
        process.env.DATABASE_URL && "DATABASE_URL",
        process.env.POSTGRES_URL && "POSTGRES_URL",
        process.env.POSTGRES_PRISMA_URL && "POSTGRES_PRISMA_URL",
        process.env.POSTGRES_URL_NON_POOLING && "POSTGRES_URL_NON_POOLING",
        process.env.POSTGRES_URL_NO_SSL && "POSTGRES_URL_NO_SSL",
        process.env.DATABASE_URL_OVERRIDE && "DATABASE_URL_OVERRIDE",
      ].filter(Boolean),
    },
  })
}
