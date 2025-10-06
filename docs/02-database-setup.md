# Database Setup

## Neon PostgreSQL Database

ReVive IMPACT uses Neon as its PostgreSQL database provider. Neon offers serverless PostgreSQL with automatic scaling and HIPAA compliance options.

## Initial Setup

### 1. Create Neon Project

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Choose a region close to your Cloud Run deployment
4. Enable HIPAA compliance if handling protected health information

### 2. Get Connection Strings

Neon provides multiple connection strings:

\`\`\`env
# Pooled connection (recommended for serverless)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Direct connection (for migrations)
DATABASE_URL_UNPOOLED=postgresql://user:password@host/database?sslmode=require

# Additional Neon variables
PGHOST=your-host.neon.tech
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database
\`\`\`

### 3. Run Database Schema

Execute the complete schema creation script:

\`\`\`sql
-- Run this file: scripts/00-complete-database-schema.sql
\`\`\`

This creates all necessary tables:
- `providers` - Staff members providing services
- `clients` - Individuals receiving services
- `contacts` - Service delivery records
- `ot_checkins` - Occupational therapy check-ins
- `ot_goals` - Client goals and progress tracking
- `intake_forms` - New client intake information
- `alerts` - System alerts and notifications
- `outreach_*` - Outreach program tables

### 4. Seed Initial Data

Visit the setup endpoint to create sample data:

\`\`\`
https://your-app-url/api/setup
\`\`\`

This creates:
- 7 sample providers
- 11 sample clients
- 5 sample contact records
- 2 sample OT check-ins
- 2 sample OT goals

### 5. Generate Test Data (Optional)

For development/testing with realistic data:

\`\`\`
https://your-app-url/api/generate-contacts
\`\`\`

This generates 1000+ contact records with realistic distributions.

## Database Schema Overview

### Core Tables

**providers**
- Staff members who provide services
- Fields: name, role, active status

**clients**
- Individuals receiving services
- Fields: name, demographics, contact info, status

**contacts**
- Service delivery records
- Fields: client, provider, date, services, location, notes

**ot_checkins**
- Occupational therapy sessions
- Fields: client, provider, date, services, goals addressed

**ot_goals**
- Client goals and progress tracking
- Fields: client, goal text, target date, progress updates

### Outreach Tables

**outreach_clients**
- Outreach program participants
- Separate from main client table

**outreach_contacts**
- Outreach service delivery records

**outreach_locations**
- Physical locations for outreach services

**outreach_runs**
- Scheduled outreach service runs

**outreach_inventory**
- Supplies and materials tracking

## Environment Variables

Required database environment variables:

\`\`\`env
# Primary connection (pooled)
DATABASE_URL=postgresql://...

# Direct connection for migrations
DATABASE_URL_UNPOOLED=postgresql://...

# Individual components (used by some queries)
PGHOST=your-host.neon.tech
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
\`\`\`

## Backup and Recovery

### Automated Backups

Neon provides automatic backups:
- Point-in-time recovery up to 7 days (Free tier)
- Extended retention with paid plans

### Manual Backup

\`\`\`bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
\`\`\`

## Troubleshooting

### Connection Issues

**Error: "relation does not exist"**
- Run the schema creation script
- Verify DATABASE_URL points to correct database

**Error: "too many connections"**
- Use pooled connection string (DATABASE_URL)
- Reduce connection pool size in application

**Error: "SSL required"**
- Ensure connection string includes `?sslmode=require`

### Performance Optimization

1. **Indexes**: Schema includes indexes on frequently queried columns
2. **Connection Pooling**: Use pooled connection for serverless
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

## Migration Strategy

When updating schema:

1. Create new migration script: `scripts/XX-migration-name.sql`
2. Test on development database
3. Apply to production during maintenance window
4. Verify with database stats endpoint: `/api/admin/database-stats`
