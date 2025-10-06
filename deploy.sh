#!/bin/bash

# Deployment script for Google Cloud Run
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME="revive-impact"
ENV=${1:-"production"}

echo "🚀 Deploying ReVive IMPACT to Google Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Environment: $ENV"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Error: Not logged in to gcloud"
    echo "   Run: gcloud auth login"
    exit 1
fi

# Set project
echo "📋 Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Build and deploy
echo "🏗️  Building and deploying..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300 \
  --env-vars-file .env.yaml

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "   Service URL: $SERVICE_URL"
echo ""
echo "📊 View logs:"
echo "   gcloud run services logs read $SERVICE_NAME --region $REGION"
echo ""
echo "🔍 Monitor service:"
echo "   https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
