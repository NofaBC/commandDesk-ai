import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifySession } from '@/lib/firebase/session';
import type { RatingValue, RatingReason } from '@/types';

/**
 * Handle rating links from emails (GET with query params)
 * GET /api/interactions/:id/rate?rating=helpful
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');

    if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
      return new NextResponse(
        '<html><body style="font-family: sans-serif; text-align: center; padding: 50px;"><h1>Invalid Rating</h1><p>Please use the rating links from your email.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      );
    }

    // Process rating
    const db = adminDb();
    const interactionRef = db.collection('interactions').doc(id);
    const doc = await interactionRef.get();

    if (doc.exists) {
      await interactionRef.update({
        rating: rating as RatingValue,
        ratedAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Interaction ${id} rated as: ${rating} (via email link)`);
    }

    // Return thank you page
    const isHelpful = rating === 'helpful';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Thank You for Your Feedback</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
      margin: 1rem;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-size: 1.875rem;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
      font-size: 1rem;
    }
    .footer {
      font-size: 0.875rem;
      margin-top: 2rem;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isHelpful ? '🎉' : '📝'}</div>
    <h1>Thank You for Your Feedback!</h1>
    <p>
      ${isHelpful 
        ? "We're glad our response was helpful! Your feedback helps us continue improving our automated support."
        : "Thank you for letting us know. We'll use your feedback to improve our responses. If you need immediate assistance, please reply to the original email and a team member will help you."}
    </p>
    <p class="footer">You can close this window now.</p>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Rating GET error:', error);
    return new NextResponse(
      '<html><body style="font-family: sans-serif; text-align: center; padding: 50px;"><h1>Error</h1><p>There was an error processing your rating. Please try again or contact support.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}

/**
 * Submit rating for an interaction via API
 * POST /api/interactions/:id/rate
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { rating, reason } = body as { 
      rating: RatingValue; 
      reason?: RatingReason;
    };

    if (!rating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    // Validate rating
    const validRatings: RatingValue[] = ['helpful', 'not_helpful', null];
    if (!validRatings.includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be: helpful, not_helpful' },
        { status: 400 }
      );
    }

    const db = adminDb();
    const interactionRef = db.collection('interactions').doc(id);
    const doc = await interactionRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      );
    }

    // Update with rating
    await interactionRef.update({
      rating,
      ratingReason: reason || null,
      ratedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Interaction ${id} rated as: ${rating}${reason ? ` (reason: ${reason})` : ''}`);

    return NextResponse.json({
      success: true,
      interactionId: id,
      rating,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to submit rating',
      },
      { status: 500 }
    );
  }
}
