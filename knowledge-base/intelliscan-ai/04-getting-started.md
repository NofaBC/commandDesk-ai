IntelliScan AI - Getting Started Guide
Quick Start

IntelliScan AI is designed to help developers and security teams quickly identify vulnerabilities in web applications. The platform is cloud-based and requires minimal setup.

Step 1: Create Your Account

Go to the IntelliScan AI sign-up page at https://nofabusinessconsulting.com/intelliscan-ai/

Create an account using your email and password

Log in and access the security dashboard

Begin with the Free plan or choose a paid plan

Step 2: Verify Domain Ownership

Important: You must verify domain ownership before scanning.

Add your domain to IntelliScan AI

Complete the domain verification process (DNS record or file upload)

Wait for verification confirmation

Only scan domains you own or have explicit authorization to test

Note: Unauthorized scanning is strictly prohibited and may violate applicable laws.

Step 3: Configure Your First Scan

After domain verification:

Navigate to the Scan Dashboard

Select "New Scan"

Choose your verified domain

Select scan type (Basic, Standard DAST, or Deep - depending on your plan)

Configure scan options if needed

Step 4: Run Your Security Scan

Start the scan

Monitor progress in real-time (average completion time: under 90 seconds)

Wait for scan completion

Review the security report

Step 5: Review Security Findings

After the scan completes:

View the security dashboard showing all detected vulnerabilities

Review vulnerability severity (Critical, High, Medium, Low)

Read detailed descriptions of each finding

Check the OWASP category for each vulnerability

Review affected endpoints and code locations

Step 6: Fix Vulnerabilities

For each identified vulnerability:

Read the step-by-step fix guidance provided

Review the recommended remediation steps

Implement fixes in your codebase

Re-scan to verify fixes (if scans remaining in your plan)

Step 7: Integrate into CI/CD (Optional)

For automated security scanning:

Access API documentation from your dashboard

Generate API credentials

Configure your CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins, etc.)

Set up automated scanning on code commits or deployments

Configure deployment blocking for critical vulnerabilities

Step 8: Understand Scan Results

Scan reports include:

Vulnerability Name and Description
Clear explanation of the security issue found.

Severity Rating
Critical, High, Medium, or Low severity classification.

OWASP Category
Which OWASP Top 10 category the vulnerability falls under.

Affected Locations
Specific URLs, endpoints, or code locations affected.

Proof-of-Concept (Pro plan)
Demonstration of how the vulnerability can be exploited.

Remediation Steps
Detailed guidance on how to fix the issue.

Scan Limits by Plan

Free Plan: 1 scan per month
Starter Plan: 5 scans per month
Pro Plan: 15 scans per month
Business Plan: Unlimited scans

Important: Unused scans do not roll over to the next month.

Best Practices

Scan Regularly
Schedule regular security scans (weekly or monthly depending on your plan).

Scan Before Deployment
Always scan applications before deploying to production.

Fix Critical Issues First
Prioritize fixing Critical and High severity vulnerabilities.

Verify Fixes
Re-scan after implementing fixes to ensure vulnerabilities are resolved.

Use Authenticated Scanning
Enable authenticated scanning to test protected areas (Pro plan and above).

Monitor Configuration Changes
Track configuration changes that might introduce vulnerabilities.

Export Reports
Export scan results for compliance and audit purposes.

Setup Time

Platform setup: 5 minutes
Domain verification: 5-10 minutes
First scan: Under 90 seconds
CI/CD integration: 15-30 minutes (optional)

Supported Technologies

IntelliScan AI works with applications built using:

Web frameworks (React, Angular, Vue, Next.js, etc.)
Backend technologies (Node.js, Python, PHP, Ruby, Java, .NET, etc.)
APIs (REST, GraphQL, SOAP)
Cloud platforms (AWS, Azure, Google Cloud)
Modern and legacy web applications

Need Help?

Contact support at:

supportdesk@nofabusinessconsulting.com

Resources:

Documentation: Available in your dashboard
API Documentation: For CI/CD integration
Video tutorials: Getting started guides
Security blog: Best practices and tips
