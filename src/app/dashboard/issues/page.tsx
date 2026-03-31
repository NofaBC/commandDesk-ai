'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Interaction, IssueCategory } from '@/types';

// Human-readable labels for issue categories
const CATEGORY_LABELS: Record<IssueCategory, string> = {
  // Technical
  login_issues: '🔐 Login Issues',
  performance_slow: '🐌 Performance/Slow',
  feature_not_working: '🔧 Feature Not Working',
  data_sync_error: '🔄 Data Sync Errors',
  integration_problem: '🔗 Integration Problems',
  mobile_app_issue: '📱 Mobile App Issues',
  browser_compatibility: '🌐 Browser Compatibility',
  // Billing
  payment_failed: '💳 Payment Failed',
  subscription_cancel: '❌ Cancellation Requests',
  refund_request: '💰 Refund Requests',
  pricing_question: '💵 Pricing Questions',
  invoice_request: '📄 Invoice Requests',
  // Account
  password_reset: '🔑 Password Reset',
  account_locked: '🔒 Account Locked',
  profile_update: '👤 Profile Updates',
  data_export: '📤 Data Export',
  account_deletion: '🗑️ Account Deletion',
  // Other
  how_to_question: '❓ How-To Questions',
  feature_request: '💡 Feature Requests',
  feedback: '📝 Feedback',
  other: '📋 Other',
};

// Group categories by type
const CATEGORY_GROUPS = {
  'Technical Issues': ['login_issues', 'performance_slow', 'feature_not_working', 'data_sync_error', 'integration_problem', 'mobile_app_issue', 'browser_compatibility'],
  'Billing Issues': ['payment_failed', 'subscription_cancel', 'refund_request', 'pricing_question', 'invoice_request'],
  'Account Issues': ['password_reset', 'account_locked', 'profile_update', 'data_export', 'account_deletion'],
  'Other': ['how_to_question', 'feature_request', 'feedback', 'other'],
};

interface CategoryStats {
  category: IssueCategory;
  count: number;
  recentInteractions: Interaction[];
}

export default function IssuesPage() {
  const [stats, setStats] = useState<Record<string, CategoryStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');

  const fetchIssueStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/issues/stats?range=${dateRange}`);
      const data = await response.json();
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to fetch issue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueStats();
  }, [dateRange]);

  const getTotalForGroup = (categories: string[]) => {
    return categories.reduce((sum, cat) => sum + (stats[cat]?.count || 0), 0);
  };

  return (
    <>
      <Header onRefresh={fetchIssueStats} isRefreshing={loading} />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Issues by Category</h1>
            <p className="text-gray-600">
              Track and analyze support issues to identify patterns
            </p>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading issue statistics...</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => {
              const groupTotal = getTotalForGroup(categories);
              if (groupTotal === 0) return null;
              
              return (
                <Card key={groupName}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{groupName}</span>
                      <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full">
                        {groupTotal} issues
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categories.map((cat) => {
                        const catStats = stats[cat];
                        const count = catStats?.count || 0;
                        if (count === 0) return null;
                        
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as IssueCategory)}
                            className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                              selectedCategory === cat
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl font-bold text-gray-900">{count}</div>
                            <div className="text-sm text-gray-600">
                              {CATEGORY_LABELS[cat as IssueCategory]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* No issues message */}
            {Object.values(stats).every(s => !s || s.count === 0) && (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl">📭</span>
                <p className="mt-2">No issues found for this time period</p>
              </div>
            )}
          </div>
        )}

        {/* Selected category detail */}
        {selectedCategory && stats[selectedCategory] && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{CATEGORY_LABELS[selectedCategory]} - Recent Issues</span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats[selectedCategory].recentInteractions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{interaction.subject}</p>
                        <p className="text-sm text-gray-500">{interaction.from}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        interaction.routingOutcome === 'auto_replied'
                          ? 'bg-green-100 text-green-800'
                          : interaction.routingOutcome === 'escalated_techsupport'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {interaction.routingOutcome.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {interaction.classification?.summary}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(interaction.receivedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
