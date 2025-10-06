# Troubleshooting Guide

## Common Issues and Solutions

### Database Connection Issues

#### Error: "relation does not exist"

**Cause:** Database schema not created or wrong database connection.

**Solution:**
1. Verify DATABASE_URL environment variable
2. Run schema creation script: `scripts/00-complete-database-schema.sql`
3. Check database name in connection string

\`\`\`bash
# Verify connection
psql $DATABASE_URL -c "SELECT version();"

# List tables
psql $DATABASE_URL -c "\dt"
\`\`\`

#### Error: "too many connections"

**Cause:** Connection pool exhausted.

**Solution:**
1. Use pooled connection string (DATABASE_URL, not DATABASE_URL_UNPOOLED)
2. Reduce max connections in Neon dashboard
3. Implement connection pooling in application

\`\`\`typescript
// Use Neon's serverless driver (already configured)
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)
\`\`\`

#### Error: "SSL connection required"

**Cause:** Missing SSL mode in connection string.

**Solution:**
Add `?sslmode=require` to connection string:

\`\`\`env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
\`\`\`

### Deployment Issues

#### Cloud Run: Container fails to start

**Symptoms:** Service shows "Revision failed" status.

**Diagnosis:**
\`\`\`bash
gcloud run services logs read revive-impact --limit 100
\`\`\`

**Common Causes:**

1. **Missing environment variables**
   \`\`\`bash
   # Set required variables
   gcloud run services update revive-impact \
     --set-env-vars DATABASE_URL=$DATABASE_URL
   \`\`\`

2. **Port binding issue**
   - Cloud Run requires listening on PORT env var
   - Next.js automatically uses PORT if set
   - Verify in logs: "Server listening on port 8080"

3. **Build failure**
   \`\`\`bash
   # Test build locally
   docker build -t test .
   docker run -p 3000:3000 test
   \`\`\`

#### Cloud Run: High latency / cold starts

**Symptoms:** First request takes 5-10 seconds.

**Solutions:**

1. **Set minimum instances**
   \`\`\`bash
   gcloud run services update revive-impact \
     --min-instances 1
   \`\`\`

2. **Increase memory**
   \`\`\`bash
   gcloud run services update revive-impact \
     --memory 1Gi
   \`\`\`

3. **Enable CPU boost**
   \`\`\`bash
   gcloud run services update revive-impact \
     --cpu-boost
   \`\`\`

### Application Issues

#### Data not loading / infinite loading spinner

**Diagnosis:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests

**Common Causes:**

1. **API endpoint error**
   - Check API route logs
   - Verify database connection
   - Check for SQL syntax errors

2. **CORS issue**
   - Verify API route returns proper headers
   - Check if request is cross-origin

3. **SWR cache issue**
   \`\`\`typescript
   // Force revalidation
   mutate('/api/contacts')
   \`\`\`

#### Services not saving / updating

**Symptoms:** Changes don't persist after refresh.

**Diagnosis:**
1. Check browser Console for errors
2. Check Network tab for failed POST/PUT requests
3. Verify database write permissions

**Solutions:**

1. **Check API route**
   \`\`\`typescript
   // Add logging
   console.log('[v0] Saving contact:', data)
   \`\`\`

2. **Verify database permissions**
   \`\`\`sql
   -- Check user permissions
   SELECT * FROM information_schema.role_table_grants 
   WHERE grantee = 'your_user';
   \`\`\`

3. **Check for validation errors**
   - Required fields missing
   - Invalid data types
   - Constraint violations

#### Client drawer not opening

**Symptoms:** Clicking client name does nothing.

**Diagnosis:**
1. Check Console for JavaScript errors
2. Verify client data exists
3. Check if drawer component is rendered

**Solutions:**

1. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Check client data**
   \`\`\`typescript
   // Add logging
   console.log('[v0] Opening drawer for:', clientName)
   \`\`\`

3. **Verify drawer state**
   \`\`\`typescript
   // Check if drawer is controlled properly
   const [isOpen, setIsOpen] = useState(false)
   \`\`\`

### Performance Issues

#### Slow query performance

**Diagnosis:**
\`\`\`sql
-- Analyze slow query
EXPLAIN ANALYZE
SELECT * FROM contacts WHERE client_name = 'John Doe';
\`\`\`

**Solutions:**

1. **Add indexes**
   \`\`\`sql
   CREATE INDEX idx_contacts_client_name ON contacts(client_name);
   CREATE INDEX idx_contacts_date ON contacts(contact_date);
   \`\`\`

2. **Optimize query**
   - Use specific columns instead of SELECT *
   - Add WHERE clauses to limit results
   - Use LIMIT for pagination

3. **Enable query caching**
   \`\`\`typescript
   // SWR caching
   const { data } = useSWR('/api/contacts', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000 // 1 minute
   })
   \`\`\`

#### High memory usage

**Symptoms:** Cloud Run instances using >80% memory.

**Solutions:**

1. **Increase memory allocation**
   \`\`\`bash
   gcloud run services update revive-impact --memory 1Gi
   \`\`\`

2. **Optimize queries**
   - Limit result set size
   - Use pagination
   - Avoid loading all data at once

3. **Check for memory leaks**
   - Review event listeners
   - Check for unclosed connections
   - Profile with Chrome DevTools

### Data Issues

#### Duplicate records

**Symptoms:** Same contact appears multiple times.

**Diagnosis:**
\`\`\`sql
-- Find duplicates
SELECT client_name, contact_date, COUNT(*)
FROM contacts
GROUP BY client_name, contact_date
HAVING COUNT(*) > 1;
\`\`\`

**Solutions:**

1. **Add unique constraint**
   \`\`\`sql
   ALTER TABLE contacts
   ADD CONSTRAINT unique_contact
   UNIQUE (client_name, contact_date, provider_name);
   \`\`\`

2. **Remove duplicates**
   \`\`\`sql
   DELETE FROM contacts a USING contacts b
   WHERE a.id < b.id
   AND a.client_name = b.client_name
   AND a.contact_date = b.contact_date;
   \`\`\`

#### Missing data after migration

**Symptoms:** Data present before, missing after deployment.

**Diagnosis:**
1. Check if connected to correct database
2. Verify DATABASE_URL environment variable
3. Check for migration errors

**Solutions:**

1. **Verify database connection**
   \`\`\`bash
   # Check which database you're connected to
   psql $DATABASE_URL -c "SELECT current_database();"
   \`\`\`

2. **Restore from backup**
   \`\`\`bash
   # If you have a backup
   psql $DATABASE_URL < backup.sql
   \`\`\`

3. **Re-run setup**
   - Visit `/api/setup` to recreate sample data

## Getting Help

### Check Logs

**Application Logs:**
\`\`\`bash
# Cloud Run
gcloud run services logs read revive-impact --limit 100

# Local development
# Check terminal where `pnpm dev` is running
\`\`\`

**Database Logs:**
- Access Neon dashboard
- Navigate to Operations > Logs
- Filter by time range and severity

### Debug Mode

Enable debug logging:

\`\`\`typescript
// Add to API routes
console.log('[v0] Debug info:', { variable1, variable2 })
\`\`\`

### Health Check

Visit health check endpoints:
- `/` - Application home (should load)
- `/api/contacts` - API health (should return data)
- `/api/admin/database-stats` - Database health

### Support Resources

1. **Neon Documentation**: https://neon.tech/docs
2. **Next.js Documentation**: https://nextjs.org/docs
3. **Google Cloud Run Documentation**: https://cloud.google.com/run/docs
4. **GitHub Issues**: Report bugs in repository

### Emergency Rollback

If deployment breaks production:

\`\`\`bash
# List revisions
gcloud run revisions list --service revive-impact

# Rollback to previous working revision
gcloud run services update-traffic revive-impact \
  --to-revisions PREVIOUS_REVISION=100
