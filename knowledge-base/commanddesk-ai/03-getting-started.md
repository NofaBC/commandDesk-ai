# CommandDesk AI™ - Getting Started Guide

## Welcome to CommandDesk AI™!

This guide will walk you through setting up your CommandDesk AI™ account and getting your first AI-powered support responses running.

---

## Step 1: Create Your Account (5 minutes)

1. **Visit**: nofabusinessconsulting.com/commanddesk
2. **Sign Up**: Click "Get Started" or "Sign Up"
3. **Enter Details**:
   - Business email address
   - Company name
   - Password (minimum 8 characters)
4. **Verify Email**: Check your inbox for verification link
5. **Choose Plan**: Select Free, Starter, Pro, or Business plan

**Tip**: Start with the Free plan to test the platform before committing to a paid plan.

---

## Step 2: Import Your First Knowledge Base (20-30 minutes)

A knowledge base is a collection of documentation that the AI uses to answer questions.

### Preparing Your Documentation

Before uploading, gather these materials:
- Help articles and documentation
- FAQs (Frequently Asked Questions)
- Product guides
- Troubleshooting documentation
- Policy documents
- User manuals

**Supported Formats**:
- Markdown (.md)
- Plain text (.txt)
- PDF (temporarily disabled - use markdown or text)

### Creating a Knowledge Base

1. **Go to**: Dashboard → Knowledge Base
2. **Click**: "Create New Knowledge Base"
3. **Enter Details**:
   - **Name**: e.g., "Product Support", "Billing Help"
   - **Description**: What this knowledge base covers
   - **Product Tag**: e.g., "careerpilot-ai", "techsupport-ai"
4. **Click**: "Create"

### Uploading Documents

1. **Select** your knowledge base
2. **Click**: "Upload Document"
3. **Choose** file from your computer (.md or .txt)
4. **Wait** for processing (usually under 30 seconds)
5. **Verify**: Document appears in the list with "Embedded" status

**Credit Usage**: Each document upload costs 10 credits

**Tip**: Upload documents one at a time initially to verify quality. Batch uploads can be done later.

---

## Step 3: Test Your AI Responses (10 minutes)

Before going live, test that the AI can answer questions correctly.

### Using the Test Interface

1. **Go to**: Dashboard → Test AI
2. **Select**: Knowledge base to test
3. **Ask** a sample question your customers might ask
4. **Review** the AI-generated response
5. **Rate** the answer quality (helps improve the system)

### Sample Test Questions

Try these types of questions:
- **Product Features**: "What features does [product] include?"
- **Pricing**: "How much does [product] cost?"
- **Setup**: "How do I set up [feature]?"
- **Troubleshooting**: "Why isn't [feature] working?"
- **Billing**: "How do I change my subscription?"

### Evaluating Response Quality

Good AI responses should:
- ✅ Be accurate and based on your documentation
- ✅ Be complete and answer the full question
- ✅ Include specific details (not vague generalities)
- ✅ Reference the correct product/feature
- ✅ Use appropriate tone and language

Poor responses indicate:
- ❌ Missing or incomplete documentation
- ❌ Question outside knowledge base scope
- ❌ Ambiguous documentation needing clarification

---

## Step 4: Configure Email Integration (15-20 minutes)

Connect CommandDesk AI™ to your support email to automate responses.

### Gmail Integration

1. **Go to**: Dashboard → Settings → Email Integration
2. **Select**: "Gmail"
3. **Follow** OAuth authentication flow
4. **Grant** permissions:
   - Read emails
   - Send emails
   - Modify email labels
5. **Configure** polling interval (recommended: every 2 minutes)

### Settings to Configure

**Email Filters**:
- Which emails to process (e.g., support@yourcompany.com)
- Exclude internal emails or specific senders

**Auto-Reply Settings**:
- Enable/disable automatic responses
- Confidence threshold (how sure AI must be to auto-reply)
- Response signature

**Escalation Rules**:
- When to forward to TechSupport AI™
- When to flag for human review
- Slack notifications for escalations

**Credit Usage**: Each AI response costs 2 credits (standard) or 5 credits (deep answer)

---

## Step 5: Set Up Slack Notifications (Optional, 10 minutes)

Get notified when CommandDesk processes emails or needs human intervention.

### Creating a Slack Webhook

1. **Go to**: [Slack API Apps](https://api.slack.com/apps)
2. **Create New App** → From scratch
3. **Name**: "CommandDesk AI"
4. **Select** your workspace
5. **Enable** Incoming Webhooks
6. **Add Webhook** to workspace
7. **Select** channel (e.g., #support-alerts)
8. **Copy** webhook URL

### Adding Webhook to CommandDesk

1. **Go to**: Dashboard → Settings → Integrations
2. **Click**: "Add Slack Integration"
3. **Paste** webhook URL
4. **Configure** notification types:
   - ✅ New email processed
   - ✅ Escalation to human
   - ✅ Critical severity issues
   - ✅ Credits running low
5. **Save** settings

---

## Step 6: Go Live (5 minutes)

Once everything is tested and configured:

1. **Review Settings**:
   - Knowledge base completeness
   - Email integration active
   - Auto-reply enabled
   - Escalation rules configured
2. **Enable Auto-Responses**:
   - Dashboard → Settings → Auto-Reply
   - Toggle "Enable Automatic Responses"
3. **Monitor** initial responses closely
4. **Adjust** settings based on real usage

### Going Live Checklist

Before enabling auto-responses:
- ✅ Knowledge base has at least 10-20 documents
- ✅ Test questions return accurate answers
- ✅ Email integration is working
- ✅ Escalation rules are configured
- ✅ Slack notifications are set up (optional but recommended)
- ✅ Team is aware the system is going live
- ✅ Credits are sufficient for expected volume

---

## Step 7: Monitor & Improve (Ongoing)

CommandDesk AI™ improves as you expand your knowledge base and refine settings.

### Daily Tasks
- Review AI responses in the dashboard
- Check for unanswered questions
- Verify email integration is working

### Weekly Tasks
- Analyze common questions in analytics
- Add documentation for frequent unanswered questions
- Review escalated cases
- Check credit usage and plan adequacy

### Monthly Tasks
- Full knowledge base review
- Update outdated documentation
- Review AI response quality metrics
- Optimize escalation rules
- Assess if plan needs adjustment

---

## Understanding the Dashboard

### Overview Page
- **Today's Stats**: Emails processed, auto-replied, escalated
- **Recent Activity**: Latest customer interactions
- **Credit Balance**: Remaining credits this month
- **Quick Actions**: Upload docs, test AI, view analytics

### Knowledge Base Page
- View all knowledge bases
- Upload new documents
- Edit or delete documents
- Rebuild index after major changes

### Analytics Page
- **Common Questions**: Most frequently asked
- **Unanswered Questions**: Gaps in knowledge base
- **Response Quality**: AI answer ratings
- **Credit Usage**: Consumption patterns
- **Support Deflection**: Estimated tickets prevented

### Settings Page
- Email integration configuration
- Auto-reply settings
- Escalation rules
- Team member management (Business plan)
- Slack integration
- Billing and plan management

---

## Common First-Week Scenarios

### Scenario: AI Isn't Answering Questions

**Possible Causes**:
- Knowledge base is empty or too small
- Documentation doesn't cover the question
- Confidence threshold is set too high

**Solutions**:
1. Add more documentation
2. Lower confidence threshold temporarily
3. Check if question is outside knowledge base scope

---

### Scenario: Too Many Escalations

**Possible Causes**:
- Knowledge base has gaps
- Confidence threshold is too high
- Technical questions need TechSupport AI™

**Solutions**:
1. Review escalated questions in analytics
2. Add missing documentation
3. Adjust confidence threshold
4. Ensure TechSupport AI™ integration is configured

---

### Scenario: Running Out of Credits

**Possible Causes**:
- Higher volume than expected
- Using deep answers when standard would suffice
- Multiple reindexing operations

**Solutions**:
1. Purchase top-up credits (never expire)
2. Upgrade to higher plan
3. Optimize answer type selection
4. Review credit usage in analytics

---

### Scenario: Responses Are Too Generic

**Possible Causes**:
- Documentation is too vague
- Multiple products in one knowledge base
- Missing specific details

**Solutions**:
1. Add more specific examples to documentation
2. Separate knowledge bases by product
3. Include FAQs with detailed answers
4. Add troubleshooting guides with step-by-step instructions

---

## Best Practices for Success

### Documentation Quality
- **Be Specific**: Include exact steps, not general guidance
- **Use Examples**: Show concrete examples of features
- **Keep Updated**: Review and refresh documentation regularly
- **Organize Logically**: Group related topics together
- **Include Visuals**: Describe what users should see
- **Answer "Why"**: Don't just explain "how", explain reasoning

### Knowledge Base Structure
- **One Product Per KB**: Don't mix unrelated products
- **Consistent Terminology**: Use same terms throughout
- **Comprehensive Coverage**: Cover all major features
- **Progressive Detail**: Basic info first, advanced later
- **Cross-Reference**: Link related topics

### Monitoring Performance
- **Check Daily**: Review AI responses regularly
- **Track Trends**: Watch analytics for patterns
- **Act on Gaps**: Add documentation for unanswered questions
- **Measure Success**: Track support deflection metrics
- **Gather Feedback**: Ask team about AI response quality

---

## Getting Help

### Help Center
Visit our knowledge base: nofabusinessconsulting.com/help

### Email Support
- **General Support**: supportdesk@nofabusinessconsulting.com
- **Technical Support**: techsupport-ai@nofabusinessconsulting.com

Response times:
- Free Plan: 48-72 hours
- Starter Plan: 24-48 hours
- Pro Plan: 12-24 hours
- Business Plan: Priority support with onboarding assistance

### Video Tutorials
YouTube channel: NOFA AI Factory
- Step-by-step setup guides
- Best practices demonstrations
- Feature walkthroughs

---

## You're Ready!

Congratulations! You've completed the CommandDesk AI™ setup. Your AI-powered support system is now ready to start automating customer responses and reducing your support workload.

Remember: The system improves as your knowledge base grows. Start small, monitor closely, and expand gradually for best results.

**Welcome to the future of customer support!** 🚀
