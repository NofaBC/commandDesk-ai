import { google } from 'googleapis';

export interface ParsedEmail {
  id: string;
  threadId: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: Date;
}

function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return oauth2Client;
}

function getGmailClient() {
  return google.gmail({ version: 'v1', auth: getOAuth2Client() });
}

/**
 * Fetch unread emails from the inbox.
 * Returns parsed email objects.
 */
export async function fetchUnreadEmails(
  maxResults = 10
): Promise<ParsedEmail[]> {
  const gmail = getGmailClient();

  // Only process inbox emails - use Gmail filters to whitelist legitimate senders
  // DO NOT process spam - auto-replying to spam validates the address
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread in:inbox',
    maxResults,
  });

  const messages = res.data.messages || [];
  const emails: ParsedEmail[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;

    try {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const parsed = parseGmailMessage(detail.data);
      if (parsed) {
        emails.push(parsed);
      }
    } catch (err) {
      console.error(`Failed to fetch email ${msg.id}:`, err);
    }
  }

  return emails;
}

/**
 * Mark an email as read by removing the UNREAD label.
 */
export async function markAsRead(emailId: string): Promise<void> {
  const gmail = getGmailClient();
  await gmail.users.messages.modify({
    userId: 'me',
    id: emailId,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });
}

/**
 * Parse a Gmail API message into a clean ParsedEmail object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGmailMessage(message: any): ParsedEmail | null {
  if (!message?.id || !message?.payload) return null;

  const headers = message.payload.headers || [];
  const getHeader = (name: string): string => {
    const header = headers.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (h: any) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header?.value || '';
  };

  const fromRaw = getHeader('From');
  const { email: fromEmail, name: fromName } = parseEmailAddress(fromRaw);

  const body = extractBody(message.payload);

  const internalDate = message.internalDate
    ? new Date(parseInt(message.internalDate, 10))
    : new Date();

  return {
    id: message.id,
    threadId: message.threadId || message.id,
    from: fromEmail,
    fromName: fromName || undefined,
    to: getHeader('To'),
    subject: getHeader('Subject') || '(no subject)',
    body: body || '',
    receivedAt: internalDate,
  };
}

/**
 * Extract "Name <email>" into parts.
 */
function parseEmailAddress(raw: string): { email: string; name?: string } {
  const match = raw.match(/^"?(.+?)"?\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: raw.trim() };
}

/**
 * Recursively extract the plain-text body from a Gmail message payload.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBody(payload: any): string {
  // Direct body data
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart: look for text/plain first, then text/html
  if (payload.parts) {
    // Prefer plain text
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      return decodeBase64Url(plainPart.body.data);
    }

    // Fall back to HTML (strip tags)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      const html = decodeBase64Url(htmlPart.body.data);
      return stripHtml(html);
    }

    // Recurse into nested parts
    for (const part of payload.parts) {
      const body = extractBody(part);
      if (body) return body;
    }
  }

  return '';
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
