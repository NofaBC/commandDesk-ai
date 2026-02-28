import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
  threadId?: string;
}

function getTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

/**
 * Send a reply email to a customer.
 * Uses OAuth2 to authenticate with Gmail SMTP.
 */
export async function sendReplyEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = getTransport();

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"NOFA AI Support" <${process.env.GMAIL_USER_EMAIL}>`,
      to: options.to,
      subject: options.subject.startsWith('Re:')
        ? options.subject
        : `Re: ${options.subject}`,
      text: options.body,
      html: formatHtmlEmail(options.body),
    };

    // Thread the reply if we have the original message ID
    if (options.replyToMessageId) {
      mailOptions.inReplyTo = options.replyToMessageId;
      mailOptions.references = options.replyToMessageId;
    }

    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to send email';
    console.error('Email send error:', message);
    return { success: false, error: message };
  }
}

/**
 * Wrap plain text in a simple, professional HTML template.
 */
function formatHtmlEmail(text: string): string {
  const htmlBody = text
    .split('\n\n')
    .map((para) => `<p style="margin: 0 0 12px 0; line-height: 1.5;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a;">
      ${htmlBody}
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated response from NOFA AI Support.<br>
        If you need further assistance, simply reply to this email.
      </p>
    </div>
  `.trim();
}
