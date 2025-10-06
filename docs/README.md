# ReVive IMPACT Developer Documentation

Welcome to the ReVive IMPACT developer documentation center. This comprehensive guide will help you deploy, maintain, and develop the ReVive IMPACT application on Google Cloud Run.

## 📚 Documentation Index

### Getting Started
- **[Getting Started Guide](./01-getting-started.md)** - Overview, prerequisites, and quick start
- **[Database Setup](./02-database-setup.md)** - Neon PostgreSQL configuration and schema setup
- **[Deployment Checklist](./08-deployment-checklist.md)** - Step-by-step deployment verification

### Deployment
- **[Google Cloud Run Deployment](./03-cloud-run-deployment.md)** - Complete Cloud Run deployment guide
- **[Architecture Overview](./04-architecture.md)** - System architecture and design patterns

### Development
- **[Development Guide](./07-development-guide.md)** - Local development workflow and best practices
- **[API Reference](./05-api-reference.md)** - Complete API endpoint documentation

### Operations
- **[Troubleshooting Guide](./06-troubleshooting.md)** - Common issues and solutions

## 🚀 Quick Links

### For First-Time Setup
1. Start with [Getting Started](./01-getting-started.md)
2. Set up your [Database](./02-database-setup.md)
3. Follow the [Deployment Checklist](./08-deployment-checklist.md)
4. Deploy to [Google Cloud Run](./03-cloud-run-deployment.md)

### For Developers
1. Review [Architecture Overview](./04-architecture.md)
2. Set up [Local Development](./07-development-guide.md)
3. Reference [API Documentation](./05-api-reference.md)

### For Troubleshooting
1. Check [Troubleshooting Guide](./06-troubleshooting.md)
2. Review Cloud Run logs
3. Verify database connection

## 🎯 Key Features

**ReVive IMPACT** is a comprehensive client management system featuring:

- **Contact Log** - Track all client interactions and service delivery
- **Outreach Management** - Manage outreach programs, locations, and runs
- **Client Tracking** - Detailed client profiles with service history
- **Goal Management** - Set and track client goals with progress updates
- **Analytics Dashboard** - Visualize service delivery trends and impact
- **Reports** - Generate comprehensive reports for stakeholders

## 🏗️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Google Cloud Run
- **State Management**: SWR for server state, React hooks for client state

## 📋 Prerequisites

Before deploying to Google Cloud Run:

- Node.js 18.x or higher
- pnpm package manager
- Google Cloud CLI
- Neon Database account
- Docker (for local testing)

## 🔧 Quick Start

\`\`\`bash
# Clone repository
git clone <repository-url>
cd revive-impact

# Install dependencies
pnpm install

# Configure environment
cp .env.yaml.example .env.local
# Edit .env.local with your database credentials

# Run database setup
# Execute scripts/00-complete-database-schema.sql in Neon

# Start development server
pnpm dev

# Visit http://localhost:3000
\`\`\`

## 🚢 Deployment

### Quick Deploy

\`\`\`bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to Google Cloud Run
./deploy.sh production
\`\`\`

### Manual Deploy

\`\`\`bash
gcloud run deploy revive-impact \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --env-vars-file .env.yaml
\`\`\`

See [Cloud Run Deployment Guide](./03-cloud-run-deployment.md) for detailed instructions.

## 📖 Documentation Structure

\`\`\`
docs/
├── README.md                      # This file
├── 01-getting-started.md          # Quick start guide
├── 02-database-setup.md           # Database configuration
├── 03-cloud-run-deployment.md     # Cloud Run deployment
├── 04-architecture.md             # System architecture
├── 05-api-reference.md            # API documentation
├── 06-troubleshooting.md          # Common issues
├── 07-development-guide.md        # Development workflow
└── 08-deployment-checklist.md     # Deployment verification
\`\`\`

## 🔐 Security

- Database connections use SSL
- Environment variables stored securely
- HIPAA-compliant database option available
- Non-root user in Docker container
- Secrets management with Google Secret Manager

## 📊 Monitoring

After deployment, monitor your application:

\`\`\`bash
# View logs
gcloud run services logs read revive-impact --limit 50

# Check service status
gcloud run services describe revive-impact --region us-central1
\`\`\`

## 🆘 Getting Help

1. **Check Documentation** - Review relevant guide above
2. **View Logs** - Check Cloud Run logs for errors
3. **Database Health** - Visit `/api/admin/database-stats`
4. **Troubleshooting** - See [Troubleshooting Guide](./06-troubleshooting.md)

## 🤝 Contributing

When making changes:

1. Create a feature branch
2. Test locally
3. Update documentation if needed
4. Submit pull request
5. Deploy after review

See [Development Guide](./07-development-guide.md) for detailed workflow.

## 📝 License

[Add your license information here]

## 📞 Support

For technical support:
- Review documentation in this folder
- Check application logs
- Contact development team

---

**Last Updated**: January 2025

**Version**: 1.0.0
\`\`\`
