import { NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * GET /api/debug/test-connections
 * 
 * Test all service connections without processing emails.
 */
export async function GET() {
  const results = {
    gmail: { status: 'unknown', message: '' },
    firebase: { status: 'unknown', message: '' },
    openai: { status: 'unknown', message: '' },
    pinecone: { status: 'unknown', message: '' },
    environment: {
      GMAIL_CLIENT_ID: !!process.env.GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET: !!process.env.GMAIL_CLIENT_SECRET,
      GMAIL_REFRESH_TOKEN: !!process.env.GMAIL_REFRESH_TOKEN,
      GMAIL_USER_EMAIL: process.env.GMAIL_USER_EMAIL || 'NOT SET',
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      PINECONE_API_KEY: !!process.env.PINECONE_API_KEY,
    },
  };

  // Test 1: Gmail OAuth2
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Try to get user profile (lighter than fetching messages)
    await gmail.users.getProfile({ userId: 'me' });
    
    results.gmail.status = 'success';
    results.gmail.message = 'Gmail API connected successfully';
  } catch (error) {
    results.gmail.status = 'error';
    results.gmail.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test 2: Firebase
  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    const db = adminDb();
    
    // Try to access Firestore (just checking connection, not creating data)
    await db.collection('_health_check').limit(1).get();
    
    results.firebase.status = 'success';
    results.firebase.message = 'Firebase connected successfully';
  } catch (error) {
    results.firebase.status = 'error';
    results.firebase.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test 3: OpenAI
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // List models to verify API key works
    await openai.models.list();
    
    results.openai.status = 'success';
    results.openai.message = 'OpenAI API connected successfully';
  } catch (error) {
    results.openai.status = 'error';
    results.openai.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test 4: Pinecone
  try {
    if (!process.env.PINECONE_API_KEY) {
      results.pinecone.status = 'skipped';
      results.pinecone.message = 'Pinecone API key not configured';
    } else {
      const { getPineconeClient } = await import('@/lib/pinecone');
      const client = getPineconeClient();
      
      // List indexes to verify connection
      await client.listIndexes();
      
      results.pinecone.status = 'success';
      results.pinecone.message = 'Pinecone connected successfully';
    }
  } catch (error) {
    results.pinecone.status = 'error';
    results.pinecone.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Determine overall status
  const hasErrors = Object.values(results).some(
    (r) => typeof r === 'object' && 'status' in r && r.status === 'error'
  );

  return NextResponse.json(
    {
      overall: hasErrors ? 'FAILED' : 'SUCCESS',
      timestamp: new Date().toISOString(),
      ...results,
    },
    { status: hasErrors ? 500 : 200 }
  );
}
