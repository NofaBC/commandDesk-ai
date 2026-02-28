# CommandDesk AI™

AI-powered customer command center for NOFA AI Factory.

## What It Does

1. **Monitors** your support inbox continuously (Gmail API)
2. **Classifies** each email by product, intent, severity (OpenAI)
3. **Auto-replies** to common inquiries (billing, account, sales, features)
4. **Escalates** technical issues to TechSupport AI™
5. **Notifies** NOFA staff via Slack
6. **Logs** every interaction to Firebase

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Firebase** (Firestore + Auth)
- **OpenAI** GPT-4o-mini
- **Gmail API** (OAuth2)
- **Nodemailer** (SMTP replies)
- **Slack** Incoming Webhooks
- **Vercel** (hosting + cron)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Fill in your credentials

# Run dev server
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email/poll` | GET | Cron: fetch and process new emails |
| `/api/email/send` | POST | Send a reply email |
| `/api/classify` | POST | Classify an email (standalone) |
| `/api/process` | POST | Full pipeline for a single email |
| `/api/webhook` | POST | Receive TechSupport-AI callbacks |
| `/api/health` | GET | Health check |

## Deployment

Deployed via Vercel with a cron job polling every 2 minutes.

```
GitHub → Vercel → Firebase → Stripe
```

## Part of NOFA AI Factory

- **CommandDesk AI™** — Customer command center (this project)
- **TechSupport AI™** — Technical support agent
- **CareerPilot AI™** — Resume builder platform
- **AffiliateLedger AI™** — Affiliate operations
