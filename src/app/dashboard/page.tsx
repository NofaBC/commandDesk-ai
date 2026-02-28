import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Header } from '@/components/layout/Header';
import { getRecentInteractions, getTodayStats } from '@/lib/firebase/interactions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let stats = {
    emailsToday: 0,
    autoReplied: 0,
    escalated: 0,
    pending: 0,
    avgResponseTimeMs: 0,
  };

  let interactions: Awaited<ReturnType<typeof getRecentInteractions>> = [];

  try {
    [stats, interactions] = await Promise.all([
      getTodayStats(),
      getRecentInteractions(20),
    ]);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Continue with empty defaults — Firebase may not be configured yet
  }

  return (
    <>
      <Header />
      <div className="p-6 space-y-6">
        <StatsCards stats={stats} />
        <ActivityFeed interactions={interactions} />
      </div>
    </>
  );
}
