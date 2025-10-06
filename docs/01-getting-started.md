# Getting Started

## Overview

ReVive IMPACT is a Next.js application designed to manage client contacts, outreach programs, and service delivery tracking for ReVive organization. This documentation will help you deploy and maintain the application on Google Cloud Run.

## Prerequisites

Before deploying to Google Cloud Run, ensure you have:

- **Node.js** 18.x or higher
- **pnpm** package manager
- **Google Cloud CLI** installed and configured
- **Neon Database** account (PostgreSQL)
- **Docker** installed locally for testing

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Google Cloud Run (containerized)
- **Authentication**: Stack Auth (optional)

## Quick Start

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd revive-impact
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Configure database connection strings
   - Add any required API keys

4. **Run database migrations**
   - Execute `scripts/00-complete-database-schema.sql`
   - Run setup endpoint: `/api/setup`

5. **Start development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

6. **Access the application**
   - Open http://localhost:3000
   - Default login: See authentication documentation

## Next Steps

- [Database Setup](./02-database-setup.md)
- [Google Cloud Run Deployment](./03-cloud-run-deployment.md)
- [Architecture Overview](./04-architecture.md)
