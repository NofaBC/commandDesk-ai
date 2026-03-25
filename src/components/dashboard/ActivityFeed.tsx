'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusButton } from './StatusButton';
import { formatDate, truncate } from '@/lib/utils';
import type { Interaction, RoutingOutcome, Severity, IntentCategory } from '@/types';

interface ActivityFeedProps {
  interactions: Interaction[];
}

const severityVariant: Record<Severity, 'success' | 'warning' | 'danger' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'destructive',
};

const outcomeLabel: Record<RoutingOutcome, string> = {
  auto_replied: 'Auto-replied',
  escalated_techsupport: 'Escalated',
  pending_human: 'Needs Review',
  pending: 'Pending',
};

const outcomeVariant: Record<RoutingOutcome, 'success' | 'info' | 'warning' | 'secondary'> = {
  auto_replied: 'success',
  escalated_techsupport: 'info',
  pending_human: 'warning',
  pending: 'secondary',
};

const intentLabel: Record<IntentCategory, string> = {
  technical: 'Technical',
  billing: 'Billing',
  account: 'Account',
  sales: 'Sales',
  feature_request: 'Feature Request',
  general: 'General',
};

const statusLabel: Record<string, string> = {
  received: 'Received',
  classifying: 'Classifying',
  classified: 'Classified',
  responding: 'Responding',
  responded: 'Responded',
  escalated: 'Escalated',
  resolved: 'Resolved',
  failed: 'Failed',
};

export function ActivityFeed({ interactions }: ActivityFeedProps) {
  if (interactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No emails processed yet. CommandDesk AI is monitoring your inbox.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTechSupportUrl = (interaction: Interaction) => {
    if (interaction.routingOutcome === 'escalated_techsupport' && interaction.techSupportCaseId) {
      // TechSupport AI uses /en/ prefix for internationalization
      return `${process.env.NEXT_PUBLIC_TECHSUPPORT_URL || 'https://tech-support-ai-one.vercel.app'}/en/dashboard/cases/${interaction.techSupportCaseId}`;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interactions.map((interaction) => {
            const techSupportUrl = getTechSupportUrl(interaction);
            const isClickable = techSupportUrl !== null;

            return (
              <div
                key={interaction.id}
                className={`flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 ${
                  isClickable ? 'hover:bg-accent/50 cursor-pointer transition-colors rounded-lg p-2 -m-2' : ''
                }`}
                onClick={() => {
                  if (techSupportUrl) {
                    window.open(techSupportUrl, '_blank');
                  }
                }}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {interaction.fromName || interaction.from}
                    </span>
                    {interaction.classification && (
                      <>
                        <Badge variant={severityVariant[interaction.classification.severity]}>
                          {interaction.classification.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {intentLabel[interaction.classification.intent]}
                        </Badge>
                      </>
                    )}
                    <Badge 
                      variant={interaction.status === 'resolved' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {statusLabel[interaction.status] || interaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{interaction.subject}</p>
                  {interaction.classification?.summary && (
                    <p className="text-xs text-muted-foreground">
                      {truncate(interaction.classification.summary, 120)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(interaction.receivedAt)}</span>
                    {interaction.techSupportTicketNumber && (
                      <span className="font-mono text-primary">
                        {interaction.techSupportTicketNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                  <Badge variant={outcomeVariant[interaction.routingOutcome]}>
                    {outcomeLabel[interaction.routingOutcome]}
                  </Badge>
                  <StatusButton
                    interactionId={interaction.id}
                    currentStatus={interaction.status}
                    routingOutcome={interaction.routingOutcome}
                  />
                  {isClickable && (
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
