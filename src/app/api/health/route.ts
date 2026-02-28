import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'commanddesk-ai',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
