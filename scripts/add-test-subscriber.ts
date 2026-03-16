/**
 * Admin script to add test subscriber to Firebase
 * Run with: npx tsx scripts/add-test-subscriber.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (!serviceAccountPath) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_PATH not set');
    process.exit(1);
  }

  initializeApp({
    credential: cert(require(serviceAccountPath)),
  });
}

const db = getFirestore();

async function addTestSubscriber() {
  const testSubscriber = {
    id: 'test-fnasserg',
    email: 'fnasserg@gmail.com',
    name: 'Test User',
    status: 'active',
    plan: 'professional',
    products: ['careerpilot-ai', 'commanddesk-ai'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await db.collection('subscribers').doc(testSubscriber.id).set(testSubscriber);
    console.log('✅ Test subscriber added successfully!');
    console.log('   Email:', testSubscriber.email);
    console.log('   Status:', testSubscriber.status);
    console.log('   Products:', testSubscriber.products.join(', '));
  } catch (error) {
    console.error('❌ Error adding subscriber:', error);
    process.exit(1);
  }
}

addTestSubscriber();
