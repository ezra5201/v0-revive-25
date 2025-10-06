# Database Setup Guide for HIPAA Instance

## Quick Start

Your HIPAA upgrade created a new empty database. Follow these steps to restore functionality:

### Step 1: Create Database Schema

Run the complete schema creation script:

1. Click "Run Script" on `scripts/00-complete-database-schema.sql`
2. Wait for completion (creates all tables, indexes, and constraints)

### Step 2: Seed Sample Data

After the schema is created, seed sample data by visiting:

\`\`\`
https://your-app-url.vercel.app/api/setup
\`\`\`

This will automatically:
- ✅ Verify all tables exist
- ✅ Create 7 sample providers (Elena Ahmed, Sofia Cohen, etc.)
- ✅ Create 11 sample clients (mix of male/female names)
- ✅ Create 5 sample contact records
- ✅ Create 2 sample OT check-ins
- ✅ Create 2 sample OT goals

### Step 3: Generate More Sample Data (Optional)

For a more realistic dataset with 1000 contacts, visit:

\`\`\`
https://your-app-url.vercel.app/api/generate-contacts
\`\`\`

This creates:
- 40 contacts for today (06/30/2025)
- 384 contacts for 2025 (Jan-June)
- 576 contacts for 2021-2024
- Realistic service distributions and holiday clustering

## What Happened with HIPAA Upgrade?

When you upgraded to HIPAA compliance, Neon:
1. Created a **new database instance** in a HIPAA-compliant environment
2. Updated your connection strings to point to the new instance
3. Left your old database intact (but disconnected)

Your app now points to an empty HIPAA database, which is why you're seeing "relation does not exist" errors.

## Verification

After setup, verify your database by checking the dashboard. You should see:
- Providers: 7
- Clients: 11
- Contacts: 5+ (or 1000+ if you ran generate-contacts)
- OT Check-ins: 2+
- OT Goals: 2+

## Troubleshooting

If you see errors:
1. Ensure `scripts/00-complete-database-schema.sql` completed successfully
2. Check that your environment variables point to the HIPAA database
3. Verify the setup API endpoint returns success
4. Check browser console for any error messages
