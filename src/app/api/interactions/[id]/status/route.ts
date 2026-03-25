import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase/admin';
import type { InteractionStatus } from '@/types';

/**
 * Update interaction status
 * PATCH /api/interactions/:id/status
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { status } = body as { status: InteractionStatus };

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: InteractionStatus[] = [
      'received',
      'classifying',
      'classified',
      'responding',
      'responded',
      'escalated',
      'resolved',
      'failed',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const interactionRef = db.collection('interactions').doc(id);
    const doc = await interactionRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      );
    }

    // Update status
    await interactionRef.update({
      status,
      updatedAt: new Date(),
    });

    console.log(`Updated interaction ${id} status to ${status}`);

    return NextResponse.json({
      success: true,
      interactionId: id,
      status,
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update status',
      },
      { status: 500 }
    );
  }
}
