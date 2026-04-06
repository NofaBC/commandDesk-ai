// This file shows how to handle GET requests for rating links
// The actual implementation is in route.ts (POST)
// 
// For GET requests (when user clicks link), we can either:
// 1. Redirect to a thank-you page after processing
// 2. Show inline success message
//
// Implementation example:

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

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
        '<html><body><h1>Invalid rating</h1></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Process rating
    const db = adminDb();
    const interactionRef = db.collection('interactions').doc(id);
    const doc = await interactionRef.get();

    if (doc.exists) {
      await interactionRef.update({
        rating: rating as 'helpful' | 'not_helpful',
        ratedAt: new Date(),
        updatedAt: new Date(),
      });
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
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #1f2937;
      margin-bottom: 1rem;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 500;
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
    <p style="font-size: 0.875rem; margin-top: 2rem; color: #9ca3af;">
      You can close this window now.
    </p>
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
      '<html><body><h1>Error processing rating</h1></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
