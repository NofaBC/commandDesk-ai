# CommandDesk AI™ - Frequently Asked Questions (FAQ)

## General Questions

### What is CommandDesk AI™?
CommandDesk AI™ is an AI-powered customer support automation platform. It reads customer questions, searches your company's knowledge base, and generates accurate responses automatically. The platform helps businesses reduce support workload while maintaining high-quality customer service.

### How does CommandDesk AI™ work?
The system works in three steps:
1. You upload your documentation (help articles, guides, FAQs)
2. The AI indexes this content for intelligent search
3. When customers ask questions, the AI searches your knowledge base and generates responses based on your documentation

### What is a knowledge base?
A knowledge base is a collection of documentation, help articles, FAQs, and guides that the AI uses to answer customer questions. It's the source of truth for all AI-generated responses.

### Who is CommandDesk AI™ for?
CommandDesk AI™ is designed for:
- SaaS companies wanting to automate product support
- Startups needing to scale support without growing headcount
- E-commerce businesses handling product inquiries
- Technical companies providing documentation access
- Growing businesses reducing support costs

### Is CommandDesk AI™ part of a larger platform?
Yes. CommandDesk AI™ is part of the NOFA AI Factory™ ecosystem, which includes:
- TechSupport AI™ (technical escalation)
- CareerPilot AI™ (career guidance)
- AffiliateLedger AI™ (affiliate tracking)
- VisionWing™, MagazinifyAI™, and RFPMatch AI™

These systems can work together for comprehensive business automation.

---

## Pricing & Credits

### How much does CommandDesk AI™ cost?
- **Free Plan**: $0/month (50 credits)
- **Starter Plan**: $49/month (500 credits)
- **Pro Plan**: $99/month (1,500 credits)
- **Business Plan**: $199/month (4,000 credits)

See our Pricing & Credits documentation for full details.

### What are credits?
Credits are consumption units used when the AI performs actions. Standard AI answers cost 2 credits, document imports cost 10 credits, and deep AI answers cost 5 credits.

### What happens if I run out of credits?
If you run out of credits:
1. AI responses will pause
2. You'll receive an immediate notification
3. You can either upgrade your plan or purchase top-up credits
4. Alternatively, wait for your monthly reset (subscription credits)

### Do unused credits roll over?
No. Monthly subscription credits expire at the end of each billing cycle. However, purchased top-up credits never expire and remain available until used.

### Can I buy additional credits?
Yes. You can purchase top-up credits at any time:
- Small: $25 (300 credits)
- Medium: $60 (900 credits)
- Large: $120 (2,000 credits)

Top-up credits never expire.

### Do I use credits just for browsing the dashboard?
No. Browsing, configuration, viewing analytics, and other non-AI actions do not consume credits. Only AI operations (answering questions, processing documents) use credits.

---

## Features & Capabilities

### How accurate are the AI answers?
CommandDesk AI generates answers based strictly on your uploaded knowledge base content. Accuracy improves as you add more comprehensive documentation. The AI does not make up information—it only uses what's in your knowledge base.

### Can the AI answer questions outside my knowledge base?
No. The AI only answers based on documentation you've uploaded. If a question cannot be answered from the knowledge base, it will either flag the question as unanswered or escalate to human support (depending on your settings).

### What happens if the AI cannot answer a question?
When the AI cannot find relevant information:
1. It flags the question as "unanswered"
2. You see it in your analytics dashboard
3. You can escalate to TechSupport AI™ (for technical issues)
4. You can route to human support
5. You're notified via Slack (if configured)

This helps you identify gaps in your documentation.

### Can I use multiple knowledge bases?
Yes. The number of knowledge bases allowed depends on your plan:
- Free: 1 knowledge base
- Starter: 3 knowledge bases
- Pro: 10 knowledge bases
- Business: 25 knowledge bases

### How long does it take to index documents?
Most documents are indexed within seconds. Large documents (50+ pages) may take 1-2 minutes. You'll see the status change from "Processing" to "Embedded" when complete.

### What file formats are supported?
Currently supported:
- Markdown (.md)
- Plain text (.txt)
- PDF (temporarily disabled)

We recommend markdown or plain text for best results.

### Can the AI handle multiple products?
Yes. Best practice is to create a separate knowledge base for each product. This improves answer accuracy and prevents cross-product confusion.

---

## Email Integration

### How does email integration work?
CommandDesk AI connects to your support email (Gmail supported) and:
1. Polls for new customer emails (every 2 minutes)
2. Classifies the email (product, intent, severity)
3. Generates an AI response using your knowledge base
4. Sends the response automatically or routes to human support

### Which email providers are supported?
Currently, Gmail is fully supported via OAuth2 authentication. Other providers may be added in the future.

### Can I control which emails get auto-responses?
Yes. You can configure:
- Confidence threshold (how sure AI must be)
- Email filters (which addresses to process)
- Exclude internal emails
- Escalation rules for specific question types

### Will customers know they're talking to AI?
You control the response signature. You can identify responses as AI-powered or use your standard support signature. We recommend transparency.

### What if the AI makes a mistake?
You can:
1. Disable auto-responses for specific question types
2. Increase the confidence threshold
3. Require human approval before sending
4. Monitor responses in real-time via dashboard
5. Provide feedback to improve future responses

---

## Technical Integration

### Does CommandDesk AI have an API?
API access is available on Business plans and higher. Contact support for API documentation and access credentials.

### Can I integrate with TechSupport AI™?
Yes. CommandDesk AI can automatically escalate technical questions to TechSupport AI™. You'll need:
- TechSupport AI™ tenant ID
- API key
- Configuration in Dashboard → Settings → Integrations

### Can I get Slack notifications?
Yes. Set up Slack incoming webhooks to receive notifications for:
- New emails processed
- Escalations to human support
- Critical severity issues
- Credits running low

### Does CommandDesk AI work with other NOFA AI Factory products?
Yes. CommandDesk AI is designed to integrate seamlessly with other NOFA AI Factory products like TechSupport AI™, CareerPilot AI™, and AffiliateLedger AI™ for comprehensive business automation.

---

## Security & Privacy

### Is my data secure?
Yes. CommandDesk AI™ uses:
- AES-256 encryption for data at rest
- TLS encryption for data in transit
- SOC 2 Type II certified infrastructure
- Secure authentication protocols
- Role-based access control

### Do you sell customer data?
No. Customer data is never sold to third parties. We use your data only to provide CommandDesk AI™ services.

### Can I export my data?
Yes. You can export:
- All knowledge base content
- Interaction logs
- Analytics data
- Account settings

Go to Dashboard → Settings → Privacy → Export Data.

### What happens if I delete my account?
When you delete your account:
- All data is permanently deleted within 30 days
- Knowledge bases are removed
- Interaction logs are deleted
- Backups are purged after retention period

This action is irreversible.

### Who can access my knowledge base?
Access depends on your plan:
- Free/Starter/Pro: Only account owner
- Business: Multi-user access with role-based permissions

You control who has access to your knowledge bases and with what permissions.

---

## Account Management

### How do I change my plan?
Go to Dashboard → Settings → Billing → Change Plan. You can upgrade or downgrade at any time:
- Upgrades: Take effect immediately
- Downgrades: Take effect at end of current billing cycle

### Can I cancel anytime?
Yes. There are no long-term contracts. You can cancel at any time:
1. Go to Dashboard → Settings → Billing
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Access continues until end of billing period

### What happens when I cancel?
- You retain access until the end of your billing period
- Your data is preserved for 90 days
- You can reactivate within 90 days
- After 90 days, all data is permanently deleted

### Can I get a refund?
We offer a 30-day money-back guarantee on all paid plans. Contact support@nofabusinessconsulting.com with your refund request.

### How do I add team members?
Team member access is available on Business plans:
1. Go to Dashboard → Settings → Team
2. Click "Invite Team Member"
3. Enter email address and assign role
4. They'll receive an invitation email

### What roles are available for team members?
- **Admin**: Full access to all settings and data
- **Editor**: Can manage knowledge bases and view analytics
- **Viewer**: Read-only access to dashboards and analytics

---

## Troubleshooting

### Why isn't the AI answering questions?
Common reasons:
- Knowledge base is empty or too small
- Documentation doesn't cover the question topic
- Confidence threshold is set too high
- Question is outside knowledge base scope

**Solution**: Add more documentation, lower confidence threshold, or check question relevance.

### Why are responses too generic?
Possible causes:
- Documentation is vague or lacks details
- Multiple products mixed in one knowledge base
- Missing specific examples

**Solution**: Add more specific documentation with examples, separate knowledge bases by product, include detailed FAQs.

### Why am I getting too many escalations?
Common reasons:
- Knowledge base has significant gaps
- Confidence threshold is too high
- Many technical questions (should go to TechSupport AI™)

**Solution**: Review escalated questions in analytics, add missing documentation, adjust confidence threshold.

### My credits are running out quickly. Why?
Possible causes:
- Higher question volume than expected
- Using deep answers when standard would work
- Frequent reindexing operations

**Solution**: Monitor credit usage in analytics, optimize answer types, consider upgrading plan, purchase top-up credits.

### Email integration stopped working. What do I do?
Check these:
- OAuth token may have expired (re-authenticate)
- Email polling is enabled in settings
- Filters aren't blocking all emails
- Vercel cron job is running

**Solution**: Go to Settings → Email Integration → Reconnect Gmail.

---

## Support

### How do I get help?
- **Email Support**: supportdesk@nofabusinessconsulting.com
- **Technical Support**: techsupport-ai@nofabusinessconsulting.com
- **Knowledge Base**: nofabusinessconsulting.com/help
- **Video Tutorials**: YouTube - NOFA AI Factory

### What are the support response times?
- **Free Plan**: 48-72 hours
- **Starter Plan**: 24-48 hours
- **Pro Plan**: 12-24 hours
- **Business Plan**: Priority support with onboarding

### Can I schedule a demo?
Yes. Contact supportdesk@nofabusinessconsulting.com to schedule a personalized demo with our team.

### Do you offer onboarding assistance?
Yes. Business plan customers receive onboarding assistance including:
- Setup guidance
- Knowledge base optimization
- Integration configuration
- Best practices training

---

## Still Have Questions?

If you didn't find your answer here:

1. **Search Help Center**: nofabusinessconsulting.com/help
2. **Contact Support**: supportdesk@nofabusinessconsulting.com
3. **Technical Issues**: techsupport-ai@nofabusinessconsulting.com
4. **Schedule Demo**: Request via website

We're here to help you succeed with CommandDesk AI™! 🚀
