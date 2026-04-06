/**
 * Generate rating footer for auto-reply emails
 */
export function addRatingFooter(
  emailBody: string,
  interactionId: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://command-desk-ai.vercel.app';
  
  const helpfulUrl = `${baseUrl}/api/interactions/${interactionId}/rate?rating=helpful`;
  const notHelpfulUrl = `${baseUrl}/api/interactions/${interactionId}/rate?rating=not_helpful`;
  
  const footer = `

---

**Was this response helpful?**

👍 [Yes, this helped](${helpfulUrl})  |  👎 [No, I need more help](${notHelpfulUrl})

Your feedback helps us improve our automated responses.

---

*This is an automated response from NOFA AI Support. If you need further assistance, simply reply to this email.*`;

  return emailBody + footer;
}

/**
 * Generate HTML version of rating footer
 */
export function addRatingFooterHtml(
  emailBody: string,
  interactionId: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://command-desk-ai.vercel.app';
  
  const helpfulUrl = `${baseUrl}/api/interactions/${interactionId}/rate?rating=helpful`;
  const notHelpfulUrl = `${baseUrl}/api/interactions/${interactionId}/rate?rating=not_helpful`;
  
  // Convert plain text to HTML paragraphs
  const htmlBody = emailBody
    .split('\n\n')
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  
  const footer = `
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

<div style="text-align: center; margin: 20px 0;">
  <p style="font-weight: 600; margin-bottom: 15px; color: #374151;">Was this response helpful?</p>
  
  <div style="display: inline-block;">
    <a href="${helpfulUrl}" 
       style="display: inline-block; padding: 10px 20px; margin: 0 10px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
      👍 Yes, this helped
    </a>
    
    <a href="${notHelpfulUrl}"
       style="display: inline-block; padding: 10px 20px; margin: 0 10px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
      👎 No, I need more help
    </a>
  </div>
  
  <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">Your feedback helps us improve our automated responses.</p>
</div>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

<p style="font-size: 12px; color: #6b7280; font-style: italic; text-align: center;">
  This is an automated response from NOFA AI Support. If you need further assistance, simply reply to this email.
</p>
`;

  return htmlBody + footer;
}
