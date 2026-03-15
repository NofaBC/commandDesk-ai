# CommandDesk AI™ - Master Knowledge Base

**Last Updated:** March 11, 2026  
**Version:** 1.0  
**Status:** Production  
**Audience:** Internal team reference + Customer-facing content (sections marked)

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Technical Architecture](#technical-architecture)
3. [Pricing & Credit System](#pricing--credit-system)
4. [Features & Capabilities](#features--capabilities)
5. [Email Integration & Automation](#email-integration--automation)
6. [Knowledge Base Management](#knowledge-base-management)
7. [AI Processing & Response Generation](#ai-processing--response-generation)
8. [Analytics & Monitoring](#analytics--monitoring)
9. [Security & Compliance](#security--compliance)
10. [API Reference](#api-reference)
11. [Deployment & Operations](#deployment--operations)
12. [Integrations](#integrations)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)
15. [FAQ](#faq)

---

## Product Overview

### What is CommandDesk AI™?

CommandDesk AI™ is an **AI-powered customer support automation platform** that reads and understands customer questions, searches company knowledge bases, and generates accurate responses using artificial intelligence.

The platform is designed to help SaaS founders, startups, and businesses reduce support workload while improving response quality and speed through intelligent automation.

### Core Value Proposition

**For Businesses:**
- Reduce support workload by automating responses to repetitive questions
- Provide 24/7 instant customer support
- Ensure consistent, accurate responses based on official documentation
- Scale customer support without proportionally increasing headcount
- Identify documentation gaps and common customer pain points

**For Customers:**
- Get instant answers without waiting for human agents
- Access accurate information based on official company documentation
- Self-service support through AI assistance
- Faster resolution times with consistent quality

### How It Works

1. **Knowledge Base Setup**: Upload documentation, help articles, FAQs, and guides
2. **AI Indexing**: System analyzes and indexes content using vector embeddings (Pinecone)
3. **Email Monitoring**: Continuously polls support inbox via Gmail API
4. **Question Processing**: AI classifies emails by product, intent, and severity
5. **Response Generation**: AI searches knowledge base and generates accurate responses (OpenAI GPT-4o-mini)
6. **Auto-Reply**: System sends responses automatically or escalates to humans
7. **Escalation**: Technical issues forwarded to TechSupport AI™ or human agents
8. **Notification**: Slack alerts sent for escalations and critical issues
9. **Logging**: All interactions stored in Firebase for analytics

### Company Information

- **Developer**: NOFA Business Consulting LLC
- **Platform**: NOFA AI Factory™
- **Product**: CommandDesk AI™
- **Website**: nofabusinessconsulting.com
- **Support Email**: supportdesk@nofabusinessconsulting.com
- **Technical Support**: techsupport-ai@nofabusinessconsulting.com
- **Location**: United States

### NOFA AI Factory™ Ecosystem

CommandDesk AI™ is part of the broader NOFA AI Factory™ ecosystem:

- **CommandDesk AI™**: Customer support automation (this product)
- **TechSupport AI™**: Technical escalation and complex issue resolution
- **CareerPilot AI™**: AI-powered resume builder and job search platform
- **AffiliateLedger AI™**: Affiliate tracking and reporting
- **VisionWing™**: Visual content creation
- **MagazinifyAI™**: Content transformation
- **RFPMatch AI™**: RFP matching and response generation

These systems can work together to automate operations across multiple business functions.

---

## Technical Architecture

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components (Radix UI)
- Zustand (state management)
- TanStack React Query

**Backend:**
- Next.js API Routes (serverless)
- Node.js 20+
- Firebase Admin SDK
- OpenAI GPT-4o-mini API
- Gmail API (googleapis)
- Nodemailer (SMTP)

**Database & Storage:**
- Firebase Firestore (NoSQL database)
- Firebase Auth (authentication)
- Pinecone (vector database for embeddings)

**Integrations:**
- Gmail API (OAuth2)
- Slack Incoming Webhooks
- OpenAI API
- Pinecone API
- Firebase services

**Deployment:**
- Vercel (hosting + serverless functions)
- Vercel Cron (scheduled email polling)
- GitHub (version control + CI/CD)

### System Architecture

```
Customer Email → Gmail → [Vercel Cron Poll] → Classification API
                                                      ↓
                Knowledge Base ← Pinecone ← OpenAI GPT-4o-mini
                                                      ↓
                Firebase ← Response Generation → Auto-Reply
                                                      ↓
                                        Slack Notification
                                                      ↓
                                        TechSupport AI (escalation)
```

### Data Flow

1. **Inbound Email**: Customer sends email to support@company.com
2. **Polling**: Vercel cron triggers `/api/email/poll` every 2 minutes
3. **Gmail API**: Fetches unread emails via OAuth2
4. **Classification**: OpenAI classifies email (product, intent, severity)
5. **KB Search**: Pinecone vector search finds relevant documentation
6. **Response Gen**: OpenAI generates response using KB context
7. **Confidence Check**: System evaluates confidence score
8. **Decision**:
   - High confidence → Auto-reply via Nodemailer
   - Low confidence → Escalate to human/TechSupport AI
   - Error → Log and notify
9. **Logging**: Interaction saved to Firestore
10. **Notification**: Slack webhook sends alert

### File Structure

```
commanddesk-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── email/
│   │   │   │   ├── poll/route.ts      # Cron: fetch emails
│   │   │   │   └── send/route.ts      # Send reply
│   │   │   ├── classify/route.ts      # Email classification
│   │   │   ├── process/route.ts       # Full pipeline
│   │   │   ├── webhook/route.ts       # TechSupport callback
│   │   │   └── health/route.ts        # Health check
│   │   ├── dashboard/
│   │   ├── knowledge-base/
│   │   └── settings/
│   ├── components/
│   ├── lib/
│   │   ├── firebase.ts                # Firebase config
│   │   ├── openai.ts                  # OpenAI client
│   │   ├── pinecone.ts                # Vector DB
│   │   └── gmail.ts                   # Gmail API
│   └── types/
├── knowledge-base/                     # Training data
│   ├── careerpilot-ai/
│   └── commanddesk-ai/
├── public/
├── scripts/
└── vercel.json                         # Cron configuration
```

---

## Pricing & Credit System

### Subscription Plans

#### Free Plan - $0/month

**Monthly Credits**: 50 credits

**Includes**:
- 1 Knowledge Base
- Basic AI Q&A using your knowledge base
- Community / best-effort email support

**Best For**:
- Testing the platform
- Small projects
- Proof of concept

**Estimated Usage**:
- ~25 standard AI answers
- ~5 document imports

---

#### Starter Plan - $49/month

**Monthly Credits**: 500 credits

**Includes**:
- Up to 3 Knowledge Bases
- Faster AI responses
- Improved answer quality settings
- Basic analytics (common questions, unresolved questions)
- Standard support

**Best For**:
- Small businesses
- Startups with growing support needs
- Teams managing multiple products

**Estimated Usage**:
- ~250 standard AI answers per month
- ~50 document imports
- 3 separate knowledge bases

---

#### Pro Plan - $99/month

**Monthly Credits**: 1,500 credits

**Includes**:
- Up to 10 Knowledge Bases
- Priority AI response speed
- Higher context limits for accurate answers
- Advanced analytics (support deflection, gap detection, quality metrics)
- Priority support

**Best For**:
- Growing SaaS companies
- Mid-sized businesses
- Companies with multiple products

**Estimated Usage**:
- ~750 standard AI answers per month
- ~150 document imports
- 10 separate knowledge bases

---

#### Business Plan - $199/month

**Monthly Credits**: 4,000 credits

**Includes**:
- Up to 25 Knowledge Bases
- Multi-user team access
- Basic role-based access control
- All Pro features
- Priority support with onboarding assistance

**Best For**:
- Large teams
- Multi-product organizations
- Enterprise customers

**Estimated Usage**:
- ~2,000 standard AI answers per month
- ~400 document imports
- 25 separate knowledge bases
- Multiple team members

---

### Credit System

#### Credit Costs by Action

| Action | Credits | Description |
|--------|---------|-------------|
| **Standard AI Answer** | 2 | Quick response using KB content |
| **Deep AI Answer** | 5 | Comprehensive response with citations |
| **Document Import** | 10 | Process and index new document |
| **Knowledge Base Reindex** | 50 | Complete KB rebuild |
| **Auto-generated Article** | 15 | AI drafts KB article from patterns |

#### Activities That Do NOT Use Credits

✅ Browsing knowledge base articles  
✅ Viewing documentation  
✅ Account management  
✅ Dashboard usage  
✅ Configuration changes  
✅ Basic platform navigation  
✅ Team member management  
✅ Viewing analytics  
✅ Exporting reports  
✅ Managing integrations  

### Credit Top-Ups

#### Small Top-Up - $25
- **Credits**: 300
- **Good For**: ~150 standard answers or ~30 document imports
- **Best Use**: Occasional overages or seasonal spikes

#### Medium Top-Up - $60
- **Credits**: 900
- **Good For**: ~450 standard answers or ~90 document imports
- **Best Use**: Growing businesses between plan tiers

#### Large Top-Up - $120
- **Credits**: 2,000
- **Good For**: ~1,000 standard answers or ~200 document imports
- **Best Use**: Large documentation projects or sustained high usage

### Credit Policies

**Subscription Credits:**
- ❌ Reset monthly (do NOT roll over)
- ⏰ Refresh at start of billing cycle
- 📊 Tracked daily for analytics
- ⚠️ Expire at end of billing period

**Top-Up Credits:**
- ✅ Never expire (remain until used)
- 🔄 Used AFTER subscription credits
- 💼 Transferable between plans
- 🛡️ Portable if subscription cancelled

### What Happens When Credits Run Out

1. **AI Responses Pause**: Automated responses temporarily stop
2. **System Notification**: Immediate alert sent
3. **Dashboard Warning**: Credit status displayed prominently
4. **Email Alert**: Notification sent to account administrator

**Resolution Options:**
- **Option 1**: Upgrade subscription (takes effect immediately)
- **Option 2**: Purchase top-up credits (credits never expire)
- **Option 3**: Wait for billing cycle reset (only viable for low-urgency)

---

## Features & Capabilities

### AI Customer Support

**Automated Question Answering:**
- Reads customer questions from email
- Searches knowledge base using semantic search
- Generates accurate responses based on documentation
- Confidence scoring determines auto-reply eligibility

**Multi-Product Support:**
- Separate knowledge bases for different products
- Product-specific response generation
- Cross-product reference prevention

**Response Quality:**
- Responses strictly based on uploaded documentation
- No hallucination or made-up information
- Citation of source documents
- Confidence scores for transparency

### Knowledge Base Intelligence

**Document Processing:**
- Markdown (.md) and plain text (.txt) support
- Automatic chunking and embedding
- Vector indexing via Pinecone
- Fast retrieval (sub-second search)

**Semantic Search:**
- Vector similarity search
- Context-aware matching
- Relevance scoring
- Multi-document synthesis

**KB Management:**
- Upload documents individually or batch
- Edit existing documents
- Delete outdated content
- Rebuild index after major changes

### Automated Email Support

**Email Processing:**
- Gmail API integration (OAuth2)
- Polling every 2 minutes (Vercel cron)
- Automatic classification
- Priority handling based on severity

**Classification:**
- Product identification
- Intent detection (question, complaint, request, billing)
- Severity assessment (low, medium, high, critical)
- Routing decisions

**Auto-Reply:**
- Configurable confidence threshold
- Customizable email signature
- HTML/plain text support
- Thread continuation

### Support Ticket Assistance

**Categorization:**
- Automatic tagging by product
- Intent-based routing
- Severity flagging
- Priority assignment

**Routing:**
- High confidence → Auto-reply
- Low confidence → Human escalation
- Technical issues → TechSupport AI™
- Critical severity → Immediate notification

### Knowledge Base Expansion

**Gap Detection:**
- Tracks unanswered questions
- Identifies missing documentation
- Suggests new article topics
- Priority ranking by frequency

**Auto-Draft Articles:**
- AI generates article drafts (15 credits)
- Based on common unanswered questions
- Includes structure and content suggestions
- Requires human review before publishing

### Support Analytics

**Question Analytics:**
- Most frequently asked questions
- Unanswered question log
- Question categorization
- Trend analysis over time

**Performance Metrics:**
- Response time averages
- Auto-reply success rate
- Escalation frequency
- Support deflection estimates

**Knowledge Base Metrics:**
- Document utilization
- Coverage gaps
- Outdated content flagging
- Search effectiveness

**Credit Usage:**
- Daily consumption tracking
- Usage patterns by action type
- Plan adequacy assessment
- Overage predictions

---

## Email Integration & Automation

### Gmail Integration Setup

**Prerequisites:**
- Gmail account with support email
- Google Cloud Project with Gmail API enabled
- OAuth 2.0 credentials

**Configuration Steps:**
1. Navigate to Dashboard → Settings → Email Integration
2. Select "Gmail"
3. Click "Connect Gmail"
4. Follow OAuth authentication flow
5. Grant permissions:
   - Read emails
   - Send emails
   - Modify email labels
6. Configure polling interval (default: every 2 minutes)

### Email Processing Pipeline

**Step 1: Polling**
- Vercel cron triggers `/api/email/poll` every 2 minutes
- Gmail API fetches unread emails
- Filters applied (support email only, exclude internal)

**Step 2: Classification**
- OpenAI classifies email:
  - Product: careerpilot-ai, techsupport-ai, commanddesk-ai, general
  - Intent: question, complaint, feature_request, billing, technical
  - Severity: low, medium, high, critical
- Result logged to Firestore

**Step 3: Knowledge Base Search**
- Query embedding generated via OpenAI
- Pinecone vector search (top 5 relevant docs)
- Relevance scores calculated
- Context assembled for response

**Step 4: Response Generation**
- OpenAI GPT-4o-mini generates response
- Uses KB context + email content
- Confidence score calculated
- Response stored in Firestore

**Step 5: Decision**
- High confidence (>0.75) → Auto-reply
- Medium confidence (0.5-0.75) → Flag for review
- Low confidence (<0.5) → Escalate to human
- Technical severity high → Escalate to TechSupport AI™

**Step 6: Action**
- Auto-reply: Nodemailer sends email via SMTP
- Escalation: Slack notification + human routing
- Logging: Firestore records interaction
- Gmail: Mark as read, apply label

### Auto-Reply Configuration

**Confidence Threshold:**
- Default: 0.75 (high confidence required)
- Adjustable: 0.5-0.95
- Lower = more auto-replies (higher risk)
- Higher = fewer auto-replies (safer)

**Email Signature:**
```
Best regards,
CommandDesk AI™ Support
Powered by NOFA AI Factory™

Need human assistance? Reply to this email.
```

**Customization Options:**
- Company name
- Support team name
- Disclaimer text
- Escalation instructions
- Signature logo/branding

### Email Filters

**Include Rules:**
- Emails to: support@company.com
- Emails from: external customers
- Subject not containing: [Internal]

**Exclude Rules:**
- Internal sender domains
- Autoresponder emails
- Out-of-office replies
- Bounce notifications

### Escalation Rules

**Automatic Escalation Triggers:**
- Confidence score < 0.5
- Severity = critical
- Intent = technical (if TechSupport AI enabled)
- KB search returns no results
- Customer explicitly requests human

**Escalation Destinations:**
- Human support team (Slack notification)
- TechSupport AI™ (webhook forwarding)
- Escalation email queue
- Priority inbox

---

## Knowledge Base Management

### Supported File Formats

**Current Support:**
- Markdown (.md) - **Recommended**
- Plain text (.txt)

**Temporarily Disabled:**
- PDF (.pdf) - Under development

### Document Upload Process

1. **Navigate**: Dashboard → Knowledge Base → Select KB
2. **Click**: "Upload Document"
3. **Select**: File from computer (.md or .txt)
4. **Processing**: System chunks and embeds document
5. **Status**: "Processing" → "Embedded" (usually <30 seconds)
6. **Verification**: Document appears in list
7. **Credit Usage**: 10 credits per document

### Document Chunking Strategy

**Chunk Size:** 1000 tokens per chunk  
**Overlap:** 200 tokens between chunks  
**Rationale:** Balance between context and retrieval precision

**Processing Steps:**
1. Parse document (markdown/text)
2. Split into chunks with overlap
3. Generate embeddings via OpenAI (text-embedding-ada-002)
4. Store vectors in Pinecone
5. Store metadata in Firestore

### Knowledge Base Organization

**Best Practices:**
- **One Product Per KB**: Separate knowledge bases for different products
- **Logical Grouping**: Group related topics together
- **Consistent Naming**: Use clear, descriptive document names
- **Version Control**: Include date or version in filename
- **Index Organization**: Create index/overview documents

**Naming Conventions:**
```
product-overview.md
pricing-plans.md
getting-started-guide.md
faq.md
troubleshooting-[feature].md
api-reference-[version].md
```

### Knowledge Base Reindexing

**When to Reindex:**
- After uploading 10+ new documents
- After major documentation restructuring
- After deleting multiple documents
- If search quality degrades

**How to Reindex:**
1. Navigate: Dashboard → Knowledge Base → Select KB
2. Click: "Rebuild Index"
3. Confirm: Acknowledge 50 credit cost
4. Wait: Full reindex (2-5 minutes for typical KB)
5. Verify: Test search accuracy

**Credit Usage:** 50 credits per full reindex

### Document Maintenance

**Regular Tasks:**
- Review document utilization metrics
- Update outdated content
- Remove deprecated documentation
- Add missing topics from gap analysis
- Improve low-performing documents

**Quality Indicators:**
- High search frequency = valuable
- Never retrieved = potentially irrelevant
- Low confidence scores = unclear content
- Frequent escalations = missing information

---

## AI Processing & Response Generation

### OpenAI Integration

**Model:** GPT-4o-mini  
**Purpose:** Fast, cost-effective responses with good quality  
**API Version:** Latest

**Usage:**
- Email classification
- Response generation
- Document summarization
- Article drafting

### Prompt Engineering

**Classification Prompt Structure:**
```
Classify this customer email:
Email: [email content]

Determine:
1. Product: [careerpilot-ai, techsupport-ai, commanddesk-ai, general]
2. Intent: [question, complaint, feature_request, billing, technical]
3. Severity: [low, medium, high, critical]

Return JSON format.
```

**Response Generation Prompt Structure:**
```
You are a helpful customer support agent for [Company Name].

Context from knowledge base:
[Top 5 relevant document chunks]

Customer question:
[Email content]

Generate a helpful, accurate response based ONLY on the provided context.
If the context doesn't contain the answer, say so politely and offer to escalate.
```

### Pinecone Vector Database

**Configuration:**
- **Index Name:** commanddesk-kb
- **Dimension:** 1536 (OpenAI embedding size)
- **Metric:** Cosine similarity
- **Pod Type:** s1 (standard)

**Search Parameters:**
- **Top K:** 5 (retrieve 5 most relevant chunks)
- **Minimum Score:** 0.7 (relevance threshold)
- **Namespace:** Knowledge base ID

**Metadata Stored:**
- Document ID
- Chunk index
- Source filename
- Upload timestamp
- Knowledge base ID

### Confidence Scoring

**Factors Considered:**
1. **Retrieval Score**: Pinecone similarity scores
2. **Response Certainty**: AI's own confidence assessment
3. **Context Coverage**: How well KB covers the question
4. **Answer Completeness**: Response addresses full question

**Score Ranges:**
- 0.9-1.0: Extremely high confidence
- 0.75-0.89: High confidence (auto-reply threshold)
- 0.5-0.74: Medium confidence (review recommended)
- 0-0.49: Low confidence (escalate)

**Calibration:**
- Review misclassifications weekly
- Adjust threshold based on accuracy metrics
- Track false positive/negative rates
- Refine based on customer feedback

---

## Analytics & Monitoring

### Dashboard Metrics

**Overview Page:**
- Today's emails processed
- Auto-reply count
- Escalations count
- Credits remaining
- Recent activity feed

**Question Analytics:**
- Most frequently asked questions
- Unanswered question log
- Question trends over time
- Category distribution

**Performance Metrics:**
- Average response time
- Auto-reply success rate
- Escalation rate
- Support deflection estimate

**Knowledge Base Metrics:**
- Document utilization
- Search effectiveness
- Coverage gaps
- Outdated content flags

**Credit Usage:**
- Daily consumption
- Usage by action type
- Plan adequacy indicator
- Projected overage date

### Slack Notifications

**Notification Types:**
- ✅ New email processed
- ⚠️ Escalation to human required
- 🚨 Critical severity issue
- 💳 Credits running low (75%, 90%, 100%)
- ❌ Error in processing

**Configuration:**
1. Create Slack incoming webhook
2. Add webhook URL to Dashboard → Settings → Integrations
3. Select notification types
4. Choose channel (#support-alerts)
5. Test notification

**Example Notification:**
```
🚨 ESCALATION REQUIRED

Product: CareerPilot AI
Intent: Technical Issue
Severity: High
Subject: "Cannot download resume PDF"

Reason: Confidence score 0.42 (below threshold)

View in Dashboard: [Link]
```

### Logging & Audit Trail

**Data Logged (Firestore):**
- Email metadata (from, to, subject, timestamp)
- Classification results
- KB search results
- AI response text
- Confidence score
- Action taken (auto-reply / escalate)
- Credit usage
- Error messages (if any)

**Retention:**
- Active interactions: Indefinite
- Deleted accounts: 30 days after deletion
- Export available before deletion

---

## Security & Compliance

### Data Encryption

**In Transit:**
- TLS 1.3 for all API connections
- HTTPS enforced for web traffic
- Secure WebSocket connections

**At Rest:**
- AES-256 encryption (Firestore)
- Encrypted backups
- Secure credential storage

### Authentication & Authorization

**User Authentication:**
- Firebase Authentication
- Email/password
- Multi-factor authentication (MFA) support
- Session management

**API Authentication:**
- Bearer tokens
- OAuth 2.0 for Gmail
- API keys for integrations
- Rate limiting

**Authorization:**
- Role-based access control (RBAC)
- Resource-level permissions
- Team member roles (Admin, Editor, Viewer)

### Privacy & Data Protection

**Data Collection:**
- Only data necessary for service operation
- Customer emails (for support automation)
- Knowledge base content
- Usage analytics

**Data Sharing:**
- No third-party data sharing
- No data selling
- OpenAI processing (covered by their DPA)
- Pinecone storage (covered by their DPA)

**Data Deletion:**
- User-initiated deletion available
- 30-day grace period
- Permanent deletion after 30 days
- Backup purge after retention period

**GDPR Compliance:**
- Data export available
- Right to deletion
- Processing basis documented
- Data Processing Agreement available

### Infrastructure Security

**Hosting:**
- Vercel (SOC 2 Type II certified)
- Google Cloud (Firebase - ISO 27001 certified)
- Pinecone (SOC 2 certified)

**Monitoring:**
- Uptime monitoring (99.9% SLA target)
- Error tracking
- Security event logging
- Anomaly detection

**Backup:**
- Automatic Firestore backups
- Daily backup schedule
- 30-day retention
- Point-in-time recovery

---

## API Reference

### Authentication

All API requests require Bearer token authentication:

```
Authorization: Bearer <your_api_token>
```

### Endpoints

#### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-11T15:00:00Z"
}
```

---

#### GET /api/email/poll

**Purpose:** Cron job endpoint to fetch and process new emails  
**Authentication:** Internal (Vercel cron secret)  
**Frequency:** Every 2 minutes

**Response:**
```json
{
  "processed": 5,
  "auto_replied": 3,
  "escalated": 2,
  "errors": 0
}
```

---

#### POST /api/email/send

Send a reply email.

**Request:**
```json
{
  "to": "customer@example.com",
  "subject": "Re: Your question",
  "body": "Response text",
  "threadId": "optional-gmail-thread-id"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "abc123"
}
```

---

#### POST /api/classify

Classify an email.

**Request:**
```json
{
  "email": {
    "from": "customer@example.com",
    "subject": "Question about pricing",
    "body": "How much does the Pro plan cost?"
  }
}
```

**Response:**
```json
{
  "product": "commanddesk-ai",
  "intent": "question",
  "severity": "low",
  "confidence": 0.92
}
```

---

#### POST /api/process

Process a single email through the full pipeline.

**Request:**
```json
{
  "emailId": "gmail-message-id",
  "knowledgeBaseId": "kb_123"
}
```

**Response:**
```json
{
  "classification": {...},
  "response": "Generated response text",
  "confidence": 0.85,
  "action": "auto_reply",
  "creditsUsed": 2
}
```

---

#### POST /api/webhook

Receive callbacks from TechSupport AI™.

**Request:**
```json
{
  "ticketId": "tech_456",
  "status": "resolved",
  "resolution": "Issue fixed by restarting service"
}
```

**Response:**
```json
{
  "acknowledged": true
}
```

---

### Rate Limits

- Free Plan: 100 requests/hour
- Starter Plan: 500 requests/hour
- Pro Plan: 2,000 requests/hour
- Business Plan: 10,000 requests/hour

### Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 402 | Payment Required (credits exhausted) |
| 403 | Forbidden |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Deployment & Operations

### Vercel Deployment

**Configuration:** `vercel.json`

```json
{
  "crons": [{
    "path": "/api/email/poll",
    "schedule": "*/2 * * * *"
  }]
}
```

**Deployment Steps:**
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy to production
4. Verify cron job is running

### Environment Variables

**Required:**
```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pc-...
PINECONE_INDEX_NAME=commanddesk-kb
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

**Optional:**
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
TECHSUPPORT_API_URL=https://techsupport-ai.com/api/escalate
TECHSUPPORT_API_KEY=...
```

### Monitoring

**Health Checks:**
- Vercel uptime monitoring
- Cron job execution logs
- API response time tracking

**Error Tracking:**
- Vercel error logs
- Firebase error logging
- Slack error notifications

**Performance Metrics:**
- API latency
- Database query time
- OpenAI response time
- Pinecone search latency

---

## Integrations

### Gmail OAuth2 Setup

1. **Google Cloud Console**:
   - Create project
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **CommandDesk AI Configuration**:
   - Add client ID and secret to environment
   - Implement OAuth flow
   - Store refresh token securely
   - Test connection

### TechSupport AI™ Integration

**Purpose:** Escalate technical issues automatically

**Configuration:**
1. Obtain TechSupport AI™ tenant ID
2. Generate API key
3. Add credentials to Dashboard → Settings → Integrations
4. Configure escalation rules
5. Test webhook

**Escalation Flow:**
```
CommandDesk → [POST] TechSupport API → Create Ticket
                                            ↓
                                       Assign Agent
                                            ↓
                                       Resolve Issue
                                            ↓
CommandDesk ← [POST] Webhook ← Update Status
```

### Slack Integration

**Setup:**
1. Create Slack App
2. Enable Incoming Webhooks
3. Add webhook to workspace
4. Select notification channel
5. Copy webhook URL
6. Add to CommandDesk → Settings → Integrations

**Notification Format:**
```
📧 New Email Processed
Product: CareerPilot AI
Severity: Medium
Auto-Reply: Yes (85% confidence)
Credits Used: 2
```

---

## Best Practices

### Knowledge Base Optimization

**Content Quality:**
- ✅ Be specific with exact steps and details
- ✅ Include concrete examples
- ✅ Update documentation regularly
- ✅ Use consistent terminology
- ✅ Answer "why" not just "how"

**Structure:**
- ✅ One product per knowledge base
- ✅ Logical topic grouping
- ✅ Comprehensive feature coverage
- ✅ Progressive detail (basic → advanced)
- ✅ Cross-reference related topics

**Maintenance:**
- Review monthly for accuracy
- Update based on gap analysis
- Remove deprecated content
- Add missing topics from analytics
- Refresh outdated screenshots/examples

### Response Quality

**Monitoring:**
- Review AI responses daily
- Check confidence scores
- Track escalation reasons
- Gather customer feedback
- Audit for accuracy

**Optimization:**
- Lower confidence threshold gradually
- Add specific examples to documentation
- Create detailed FAQs
- Include troubleshooting guides
- Document edge cases

### Credit Management

**Efficiency:**
- Use standard answers when appropriate
- Batch document uploads
- Avoid unnecessary reindexing
- Monitor usage patterns
- Set up usage alerts (75%, 90%)

**Planning:**
- Calculate expected monthly usage
- Add 20% buffer for spikes
- Purchase top-ups before depletion
- Upgrade plan if consistently over
- Review analytics monthly

### Security

**Access Control:**
- Use strong passwords
- Enable MFA for all users
- Review team member access regularly
- Revoke access for departed employees
- Follow principle of least privilege

**Data Protection:**
- Regularly export data
- Review privacy settings
- Audit email filters
- Monitor for anomalies
- Keep credentials secure

---

## Troubleshooting

### AI Not Answering Questions

**Symptoms:** AI escalates most questions or provides generic responses

**Possible Causes:**
- Knowledge base is empty or too small
- Documentation doesn't cover question topics
- Confidence threshold set too high
- Question outside KB scope

**Solutions:**
1. Add more comprehensive documentation
2. Lower confidence threshold (0.75 → 0.65)
3. Check if questions are in scope
4. Review gap analysis in analytics
5. Add specific FAQs for common questions

---

### Too Many Escalations

**Symptoms:** Most emails escalated to human support

**Possible Causes:**
- Knowledge base has significant gaps
- Confidence threshold too high
- Many technical questions (need TechSupport AI)
- Poor documentation quality

**Solutions:**
1. Review escalated questions in analytics
2. Identify common missing topics
3. Add detailed documentation for gaps
4. Adjust confidence threshold
5. Enable TechSupport AI™ for technical issues

---

### Generic Responses

**Symptoms:** AI responses lack specific details

**Possible Causes:**
- Documentation is too vague
- Multiple products mixed in one KB
- Missing specific examples
- Insufficient context in docs

**Solutions:**
1. Add detailed examples to documentation
2. Separate knowledge bases by product
3. Include step-by-step instructions
4. Add troubleshooting sections
5. Provide screenshots/visual descriptions

---

### Credits Running Out Quickly

**Symptoms:** Hitting credit limit before month end

**Possible Causes:**
- Higher question volume than expected
- Using deep answers unnecessarily
- Frequent reindexing operations
- Document upload spikes

**Solutions:**
1. Monitor credit usage in analytics
2. Use standard answers (2 credits) when sufficient
3. Batch document uploads
4. Avoid unnecessary reindexing
5. Purchase top-up credits or upgrade plan

---

### Email Integration Not Working

**Symptoms:** No emails being processed

**Possible Causes:**
- OAuth token expired
- Email polling disabled
- Filters blocking all emails
- Vercel cron job not running
- Gmail API quota exceeded

**Solutions:**
1. Go to Settings → Email Integration → Reconnect Gmail
2. Verify polling is enabled
3. Check email filters aren't too restrictive
4. Review Vercel cron logs
5. Check Gmail API quotas in Google Cloud Console

---

### Slow Response Times

**Symptoms:** AI takes too long to generate responses

**Possible Causes:**
- Large knowledge base slowing search
- OpenAI API latency
- Pinecone index needs optimization
- Network issues

**Solutions:**
1. Review KB size and document count
2. Consider splitting large KBs
3. Check OpenAI API status
4. Rebuild Pinecone index
5. Contact support if persistent

---

## FAQ

### General

**Q: What is CommandDesk AI™?**  
A: CommandDesk AI™ is an AI-powered customer support automation platform that reads customer questions, searches your knowledge base, and generates accurate responses automatically.

**Q: How does it work?**  
A: You upload documentation → AI indexes it → Customer emails arrive → AI searches KB → Generates response → Auto-replies or escalates.

**Q: Who is it for?**  
A: SaaS companies, startups, e-commerce businesses, technical product companies, and growing businesses wanting to automate support.

**Q: Is it part of a larger platform?**  
A: Yes, CommandDesk AI™ is part of the NOFA AI Factory™ ecosystem alongside TechSupport AI™, CareerPilot AI™, AffiliateLedger AI™, and others.

---

### Pricing

**Q: How much does it cost?**  
A: Free ($0), Starter ($49), Pro ($99), or Business ($199) per month with corresponding credit allocations.

**Q: What are credits?**  
A: Credits are consumption units. Standard AI answers cost 2 credits, document imports cost 10 credits, deep answers cost 5 credits.

**Q: Do unused credits roll over?**  
A: No, monthly subscription credits expire at end of billing cycle. Top-up credits never expire.

**Q: Can I buy additional credits?**  
A: Yes. Small ($25/300), Medium ($60/900), or Large ($120/2000) top-ups available. They never expire.

---

### Features

**Q: How accurate are AI answers?**  
A: Answers are based strictly on your uploaded documentation. Accuracy improves with comprehensive, well-written KB content.

**Q: Can AI answer questions outside my knowledge base?**  
A: No. The AI only uses documentation you've uploaded. Questions without KB coverage are flagged as unanswered or escalated.

**Q: What file formats are supported?**  
A: Markdown (.md) and plain text (.txt). PDF support temporarily disabled.

**Q: Can I use multiple knowledge bases?**  
A: Yes. Free (1), Starter (3), Pro (10), Business (25) knowledge bases per plan.

**Q: How long does document indexing take?**  
A: Most documents index in under 30 seconds. Large documents may take 1-2 minutes.

---

### Email Integration

**Q: Which email providers are supported?**  
A: Gmail is fully supported via OAuth2. Other providers may be added in future.

**Q: Can I control which emails get auto-responses?**  
A: Yes. Configure confidence threshold, email filters, exclude rules, and escalation rules.

**Q: Will customers know it's AI?**  
A: You control the signature. We recommend transparency but you can use standard support signatures.

---

### Technical

**Q: Does CommandDesk have an API?**  
A: API access available on Business plans and higher. Contact support for documentation.

**Q: Can I integrate with TechSupport AI™?**  
A: Yes. CommandDesk can automatically escalate technical questions to TechSupport AI™.

**Q: Can I get Slack notifications?**  
A: Yes. Set up incoming webhooks for notifications about new emails, escalations, critical issues, and low credits.

---

### Security

**Q: Is my data secure?**  
A: Yes. AES-256 encryption at rest, TLS in transit, SOC 2 Type II certified infrastructure, role-based access control.

**Q: Do you sell customer data?**  
A: No. Customer data is never sold to third parties.

**Q: Can I export my data?**  
A: Yes. Export all KB content, interaction logs, analytics, and settings from Dashboard → Settings → Privacy.

**Q: What happens if I delete my account?**  
A: All data permanently deleted within 30 days. Backups purged after retention period.

---

### Support

**Q: How do I get help?**  
A: Email supportdesk@nofabusinessconsulting.com (general) or techsupport-ai@nofabusinessconsulting.com (technical).

**Q: What are response times?**  
A: Free (48-72hrs), Starter (24-48hrs), Pro (12-24hrs), Business (priority with onboarding).

**Q: Can I schedule a demo?**  
A: Yes. Contact supportdesk@nofabusinessconsulting.com to schedule.

**Q: Do you offer onboarding?**  
A: Yes, Business plan includes onboarding assistance with setup, KB optimization, and best practices training.

---

## Change Log

**v1.0 - March 11, 2026**
- Initial master knowledge base creation
- Comprehensive documentation of all features and capabilities
- Technical architecture and API reference
- Best practices and troubleshooting guides
- Consolidated from existing KB documents

---

**Document Owner:** NOFA Business Consulting LLC  
**Product:** CommandDesk AI™  
**Platform:** NOFA AI Factory™  
**Status:** Production Documentation
