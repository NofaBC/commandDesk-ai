'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
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
                </div>
                <p className="text-sm font-medium">{interaction.subject}</p>
                {interaction.classification?.summary && (
                  <p className="text-xs text-muted-foreground">
                    {truncate(interaction.classification.summary, 120)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(interaction.receivedAt)}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Badge variant={outcomeVariant[interaction.routingOutcome]}>
                  {outcomeLabel[interaction.routingOutcome]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
