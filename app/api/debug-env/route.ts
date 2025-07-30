import { NextResponse } from "next/server"

export async function GET() {
  const safeSubstring = (str: string | undefined) => {
    if (!str) return "NOT_SET"
    return str.substring(0, 50) + (str.length > 50 ? "..." : "")
  }

  const checkForPsql = (str: string | undefined) => {
    if (!str) return false
    return str.includes("psql")
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
      DATABASE_URL_has_psql: checkForPsql(process.env.DATABASE_URL),
      POSTGRES_URL_has_psql: checkForPsql(process.env.POSTGRES_URL),
      POSTGRES_PRISMA_URL_has_psql: checkForPsql(process.env.POSTGRES_PRISMA_URL),
      POSTGRES_URL_NON_POOLING_has_psql: checkForPsql(process.env.POSTGRES_URL_NON_POOLING),
      POSTGRES_URL_NO_SSL_has_psql: checkForPsql(process.env.POSTGRES_URL_NO_SSL),
      DATABASE_URL_OVERRIDE_has_psql: checkForPsql(process.env.DATABASE_URL_OVERRIDE),
    },
    connectionStringPriority: {
      first: process.env.DATABASE_URL_OVERRIDE ? "DATABASE_URL_OVERRIDE" : null,
      second: process.env.DATABASE_URL ? "DATABASE_URL" : null,
      third: process.env.POSTGRES_URL ? "POSTGRES_URL" : null,
      fourth: process.env.POSTGRES_PRISMA_URL ? "POSTGRES_PRISMA_URL" : null,
      fifth: process.env.POSTGRES_URL_NON_POOLING ? "POSTGRES_URL_NON_POOLING" : null,
      sixth: process.env.POSTGRES_URL_NO_SSL ? "POSTGRES_URL_NO_SSL" : null,
    },
  })
}
