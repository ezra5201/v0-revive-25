# Deployment Checklist

## Pre-Deployment

### 1. Environment Setup

- [ ] Google Cloud account created and billing enabled
- [ ] Google Cloud CLI installed and authenticated
- [ ] Project ID configured
- [ ] Required APIs enabled (Cloud Run, Container Registry, Cloud Build)

### 2. Database Setup

- [ ] Neon database created
- [ ] Database schema deployed (`scripts/00-complete-database-schema.sql`)
- [ ] Sample data seeded (optional)
- [ ] Connection strings obtained
- [ ] Environment variables file created (`.env.yaml`)

### 3. Code Preparation

- [ ] All changes committed to Git
- [ ] Build succeeds locally (`pnpm build`)
- [ ] No console errors in development
- [ ] All tests passing (if applicable)
- [ ] Dependencies up to date

### 4. Configuration Files

- [ ] `Dockerfile` present and tested
- [ ] `cloudbuild.yaml` configured
- [ ] `.dockerignore` configured
- [ ] `.env.yaml` created from `.env.yaml.example`
- [ ] `deploy.sh` script executable (`chmod +x deploy.sh`)

## Deployment Steps

### Option 1: Using Deploy Script (Recommended)

\`\`\`bash
# Make script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production
\`\`\`

### Option 2: Manual Deployment

\`\`\`bash
# 1. Set project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Deploy
gcloud run deploy revive-impact \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --env-vars-file .env.yaml
\`\`\`

### Option 3: CI/CD with Cloud Build

\`\`\`bash
# Connect GitHub repository
gcloud builds triggers create github \
  --repo-name=revive-impact \
  --repo-owner=YOUR_ORG \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# Trigger will automatically deploy on push to main
\`\`\`

## Post-Deployment

### 1. Verification

- [ ] Application loads successfully
- [ ] All pages accessible
- [ ] Database connection working
- [ ] No errors in Cloud Run logs
- [ ] API endpoints responding

### 2. Testing

- [ ] Login functionality works
- [ ] Contact log displays data
- [ ] Create new contact works
- [ ] Client drawer opens and displays data
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Reports generate correctly

### 3. Monitoring Setup

- [ ] Cloud Run metrics dashboard reviewed
- [ ] Log-based alerts configured (optional)
- [ ] Uptime checks configured (optional)
- [ ] Error reporting enabled

### 4. Performance Check

- [ ] Initial load time acceptable (< 3 seconds)
- [ ] API response times acceptable (< 500ms)
- [ ] No memory issues
- [ ] No excessive cold starts

## Environment Variables Checklist

Ensure all required environment variables are set in `.env.yaml`:

### Required

- [ ] `DATABASE_URL` - Pooled connection string
- [ ] `DATABASE_URL_UNPOOLED` - Direct connection string
- [ ] `PGHOST` - Database host
- [ ] `PGUSER` - Database user
- [ ] `PGPASSWORD` - Database password
- [ ] `PGDATABASE` - Database name

### Optional

- [ ] `NEXT_PUBLIC_STACK_PROJECT_ID` - Stack Auth project ID
- [ ] `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth public key
- [ ] `STACK_SECRET_SERVER_KEY` - Stack Auth secret key

## Rollback Plan

If deployment fails or issues arise:

\`\`\`bash
# 1. List revisions
gcloud run revisions list --service revive-impact --region us-central1

# 2. Rollback to previous revision
gcloud run services update-traffic revive-impact \
  --to-revisions PREVIOUS_REVISION=100 \
  --region us-central1
\`\`\`

## Common Issues

### Build Fails

**Check:**
- Dockerfile syntax
- Node version compatibility
- Missing dependencies in package.json

**Solution:**
\`\`\`bash
# Test build locally
docker build -t test .
\`\`\`

### Container Fails to Start

**Check:**
- Environment variables set correctly
- Database connection string valid
- Port configuration (should use PORT env var)

**Solution:**
\`\`\`bash
# View logs
gcloud run services logs read revive-impact --limit 100
\`\`\`

### Database Connection Error

**Check:**
- Connection string includes `?sslmode=require`
- Database exists and is accessible
- Credentials are correct

**Solution:**
\`\`\`bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
\`\`\`

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] `.env.yaml` in `.gitignore`
- [ ] Database uses SSL connections
- [ ] HIPAA compliance enabled (if required)
- [ ] Service account has minimal required permissions
- [ ] Secrets stored in Secret Manager (for production)

## Cost Optimization

- [ ] Max instances set to prevent runaway costs
- [ ] Memory allocation appropriate (512Mi recommended)
- [ ] CPU allocation appropriate (1 CPU recommended)
- [ ] Minimum instances set only if needed (increases cost)
- [ ] Old revisions cleaned up regularly

## Documentation

- [ ] Deployment documented in team wiki
- [ ] Service URL shared with team
- [ ] Access credentials documented securely
- [ ] Monitoring dashboard bookmarked
- [ ] Runbook created for common operations

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
   \`\`\`bash
   gcloud run domain-mappings create \
     --service revive-impact \
     --domain app.revive.org
   \`\`\`

2. **Configure CDN** (optional)
   - Set up Cloud CDN for static assets
   - Configure caching policies

3. **Set up backups**
   - Configure automated database backups
   - Test restore procedure

4. **Monitor and optimize**
   - Review metrics weekly
   - Optimize slow queries
   - Adjust resources as needed
\`\`\`
\`\`\`

```typescript file="" isHidden
