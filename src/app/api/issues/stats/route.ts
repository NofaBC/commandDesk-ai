import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import type { IssueCategory, Interaction } from '@/types';

/**
 * GET /api/issues/stats
 * 
 * Returns issue statistics grouped by category for the specified time range.
 * Query params:
 *   - range: 'today' | 'week' | 'month' (default: 'week')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';
    
    // Calculate start date based on range
    const startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const db = adminDb();
    const snapshot = await db
      .collection('interactions')
      .where('createdAt', '>=', startDate)
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();
    
    // Group by issue category
    const stats: Record<string, {
      category: IssueCategory;
      count: number;
      recentInteractions: Partial<Interaction>[];
    }> = {};
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const category = data.classification?.issueCategory || 'other';
      
      if (!stats[category]) {
        stats[category] = {
          category: category as IssueCategory,
          count: 0,
          recentInteractions: [],
        };
      }
      
      stats[category].count++;
      
      // Keep only the 5 most recent interactions per category
      if (stats[category].recentInteractions.length < 5) {
        stats[category].recentInteractions.push({
          id: doc.id,
          from: data.from,
          subject: data.subject,
          classification: data.classification,
          routingOutcome: data.routingOutcome,
          status: data.status,
          receivedAt: data.receivedAt?.toDate?.() || new Date(data.receivedAt),
        });
      }
    });
    
    return NextResponse.json({
      stats,
      range,
      totalInteractions: snapshot.docs.length,
      startDate: startDate.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch issue stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue statistics' },
      { status: 500 }
    );
  }
}
