import type { SlackNotificationData } from '@/types';

const severityEmojis: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
  critical: '🚨',
};

const outcomeLabels: Record<string, string> = {
  auto_replied: '✅ Auto-replied',
  escalated_techsupport: '🔧 Escalated to TechSupport',
  pending_human: '👤 Needs Human Attention',
  pending: '⏳ Pending',
};

/**
 * Send a structured Slack notification about an email interaction.
 */
export async function sendSlackNotification(
  data: SlackNotificationData
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Slack webhook not configured, skipping notification');
    return { success: true };
  }

  try {
    const emoji = severityEmojis[data.severity] || '⚪';
    const outcomeLabel = outcomeLabels[data.routingOutcome] || data.routingOutcome;

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} CommandDesk: New Email Processed`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*From:*\n${data.from}`,
          },
          {
            type: 'mrkdwn',
            text: `*Product:*\n${data.product}`,
          },
          {
            type: 'mrkdwn',
            text: `*Intent:*\n${data.intent}`,
          },
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${data.severity.toUpperCase()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Subject:*\n${data.subject}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${data.summary}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Outcome:*\n${outcomeLabel}`,
        },
      },
    ];

    if (data.needsHumanAttention) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '⚠️ *This item requires human review.*',
        },
      });
    }

    if (data.dashboardUrl) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${data.dashboardUrl}|View in Dashboard>`,
        },
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks,
        text: `CommandDesk: Email from ${data.from} - ${data.intent} (${data.severity})`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Slack API error: ${text}` };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to send Slack notification';
    console.error('Slack notification error:', message);
    return { success: false, error: message };
  }
}
