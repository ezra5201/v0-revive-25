# Google Cloud Run Deployment

## Overview

Google Cloud Run is a fully managed serverless platform that automatically scales your containerized application. This guide covers deploying ReVive IMPACT to Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed and authenticated
3. **Docker** installed locally
4. **Project ID** from Google Cloud Console

## Setup Google Cloud

### 1. Install Google Cloud CLI

\`\`\`bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash

# Windows
# Download installer from cloud.google.com/sdk
\`\`\`

### 2. Authenticate

\`\`\`bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
\`\`\`

### 3. Enable Required APIs

\`\`\`bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
\`\`\`

## Dockerfile Configuration

The application includes a production-ready Dockerfile:

\`\`\`dockerfile
# See: Dockerfile in project root
\`\`\`

Key features:
- Multi-stage build for smaller image size
- Node.js 18 Alpine base
- Production dependencies only
- Health check endpoint
- Non-root user for security

## Build and Deploy

### Option 1: Using Cloud Build (Recommended)

\`\`\`bash
# Build and deploy in one command
gcloud run deploy revive-impact \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL
\`\`\`

### Option 2: Manual Docker Build

\`\`\`bash
# 1. Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/revive-impact:latest .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/revive-impact:latest

# 3. Deploy to Cloud Run
gcloud run deploy revive-impact \
  --image gcr.io/YOUR_PROJECT_ID/revive-impact:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
\`\`\`

## Environment Variables

Set environment variables during deployment:

\`\`\`bash
gcloud run deploy revive-impact \
  --set-env-vars DATABASE_URL=$DATABASE_URL \
  --set-env-vars DATABASE_URL_UNPOOLED=$DATABASE_URL_UNPOOLED \
  --set-env-vars PGHOST=$PGHOST \
  --set-env-vars PGUSER=$PGUSER \
  --set-env-vars PGPASSWORD=$PGPASSWORD \
  --set-env-vars PGDATABASE=$PGDATABASE
\`\`\`

Or use a `.env.yaml` file:

\`\`\`yaml
DATABASE_URL: postgresql://...
DATABASE_URL_UNPOOLED: postgresql://...
PGHOST: your-host.neon.tech
PGUSER: your-username
PGPASSWORD: your-password
PGDATABASE: your-database
\`\`\`

Deploy with env file:

\`\`\`bash
gcloud run deploy revive-impact \
  --env-vars-file .env.yaml
\`\`\`

## Configuration Options

### Memory and CPU

\`\`\`bash
gcloud run deploy revive-impact \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
\`\`\`

### Timeout

\`\`\`bash
gcloud run deploy revive-impact \
  --timeout 300
\`\`\`

### Concurrency

\`\`\`bash
gcloud run deploy revive-impact \
  --concurrency 80
\`\`\`

### Custom Domain

\`\`\`bash
gcloud run domain-mappings create \
  --service revive-impact \
  --domain app.revive.org
\`\`\`

## Continuous Deployment

### Using Cloud Build Triggers

Create `cloudbuild.yaml`:

\`\`\`yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/revive-impact:$COMMIT_SHA', '.']
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/revive-impact:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'revive-impact'
      - '--image'
      - 'gcr.io/$PROJECT_ID/revive-impact:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/revive-impact:$COMMIT_SHA'
\`\`\`

Connect to GitHub:

\`\`\`bash
gcloud builds triggers create github \
  --repo-name=revive-impact \
  --repo-owner=YOUR_ORG \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
\`\`\`

## Monitoring and Logging

### View Logs

\`\`\`bash
gcloud run services logs read revive-impact --limit 50
\`\`\`

### Monitor Metrics

Access Cloud Console:
- Navigate to Cloud Run > revive-impact
- View request count, latency, error rate
- Set up alerts for anomalies

### Health Checks

Cloud Run automatically monitors:
- Container startup
- HTTP health endpoint (/)
- Request success rate

## Security

### IAM Permissions

\`\`\`bash
# Allow unauthenticated access (public app)
gcloud run services add-iam-policy-binding revive-impact \
  --member="allUsers" \
  --role="roles/run.invoker"

# Or restrict to authenticated users
gcloud run services add-iam-policy-binding revive-impact \
  --member="user:admin@revive.org" \
  --role="roles/run.invoker"
\`\`\`

### Secrets Management

Use Secret Manager for sensitive data:

\`\`\`bash
# Create secret
echo -n "your-secret-value" | gcloud secrets create db-password --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Deploy with secret
gcloud run deploy revive-impact \
  --set-secrets="DATABASE_PASSWORD=db-password:latest"
\`\`\`

## Troubleshooting

### Container Fails to Start

Check logs:
\`\`\`bash
gcloud run services logs read revive-impact --limit 100
\`\`\`

Common issues:
- Missing environment variables
- Database connection failure
- Port binding (must use PORT env var)

### High Latency

- Increase memory allocation
- Enable CPU boost
- Check database connection pooling
- Review slow queries

### Cold Starts

- Use minimum instances: `--min-instances 1`
- Optimize Docker image size
- Reduce dependencies

## Cost Optimization

1. **Set max instances** to prevent runaway costs
2. **Use minimum instances** only if needed
3. **Monitor request patterns** and adjust resources
4. **Clean up old revisions** regularly

\`\`\`bash
# Keep only 3 latest revisions
gcloud run services update revive-impact \
  --revision-suffix=v1 \
  --max-instances=10
\`\`\`

## Rollback

\`\`\`bash
# List revisions
gcloud run revisions list --service revive-impact

# Rollback to previous revision
gcloud run services update-traffic revive-impact \
  --to-revisions REVISION_NAME=100
