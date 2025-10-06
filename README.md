# ReVive IMPACT

A comprehensive client management system for tracking service delivery, managing outreach programs, and monitoring client progress.

## 🚀 Quick Start

### For Developers

\`\`\`bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.yaml.example .env.local
# Edit .env.local with your database credentials

# Start development server
pnpm dev
\`\`\`

Visit http://localhost:3000

### For Deployment

See **[Developer Documentation](./docs/README.md)** for complete deployment guide.

\`\`\`bash
# Quick deploy to Google Cloud Run
chmod +x deploy.sh
./deploy.sh production
\`\`\`

## 📚 Documentation

Complete developer documentation is available in the `/docs` folder:

- **[Getting Started](./docs/01-getting-started.md)** - Setup and prerequisites
- **[Database Setup](./docs/02-database-setup.md)** - Neon PostgreSQL configuration
- **[Cloud Run Deployment](./docs/03-cloud-run-deployment.md)** - Google Cloud Run deployment
- **[Architecture](./docs/04-architecture.md)** - System design and structure
- **[API Reference](./docs/05-api-reference.md)** - API endpoints documentation
- **[Troubleshooting](./docs/06-troubleshooting.md)** - Common issues and solutions
- **[Development Guide](./docs/07-development-guide.md)** - Development workflow
- **[Deployment Checklist](./docs/08-deployment-checklist.md)** - Pre/post deployment steps

**Access documentation in the app**: Click the Settings icon (⚙️) in the top right → Developer Documentation

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Google Cloud Run
- **State Management**: SWR

## ✨ Features

- **Contact Log** - Track all client interactions and services
- **Outreach Management** - Manage locations, runs, and inventory
- **Client Profiles** - Comprehensive client information and history
- **Goal Tracking** - Set and monitor client goals
- **Analytics** - Service delivery trends and impact metrics
- **Reports** - Generate stakeholder reports

## 🔧 Development

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## 🚢 Deployment

### Prerequisites

- Google Cloud account with billing enabled
- Google Cloud CLI installed
- Neon database configured
- Environment variables set

### Deploy

\`\`\`bash
# Using deploy script
./deploy.sh production

# Or manually
gcloud run deploy revive-impact \
  --source . \
  --region us-central1 \
  --env-vars-file .env.yaml
\`\`\`

See [Cloud Run Deployment Guide](./docs/03-cloud-run-deployment.md) for details.

## 📊 Database

The application uses Neon PostgreSQL with the following main tables:

- `clients` - Client information
- `contacts` - Service delivery records
- `providers` - Staff members
- `ot_checkins` - Occupational therapy sessions
- `ot_goals` - Client goals
- `outreach_*` - Outreach program tables

Run database setup:

\`\`\`bash
# Execute schema
psql $DATABASE_URL < scripts/00-complete-database-schema.sql

# Seed sample data
curl http://localhost:3000/api/setup
\`\`\`

## 🔐 Environment Variables

Required environment variables (see `.env.yaml.example`):

\`\`\`env
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
PGHOST=your-host.neon.tech
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database
\`\`\`

## 🆘 Troubleshooting

Common issues:

- **Database connection error**: Check connection string and SSL mode
- **Build fails**: Verify Node version and dependencies
- **Container won't start**: Check environment variables and logs

See [Troubleshooting Guide](./docs/06-troubleshooting.md) for detailed solutions.

## 📝 License

[Add your license here]

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

See [Development Guide](./docs/07-development-guide.md) for workflow details.

---

For complete documentation, see the [docs folder](./docs/README.md) or access via the app's Settings menu.
\`\`\`
