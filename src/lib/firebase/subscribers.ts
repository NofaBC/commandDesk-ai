import { adminDb } from './admin';
import type { Subscriber, SubscriptionStatus } from '@/types';

/**
 * Find a subscriber by email address.
 * Returns null if not found.
 */
export async function findSubscriberByEmail(
  email: string
): Promise<Subscriber | null> {
  const db = adminDb();
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const snapshot = await db
      .collection('subscribers')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      status: data.status as SubscriptionStatus,
      plan: data.plan || 'unknown',
      products: data.products || [],
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      trialEndsAt: data.trialEndsAt?.toDate(),
      currentPeriodEnd: data.currentPeriodEnd?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error finding subscriber:', error);
    return null;
  }
}

/**
 * Check if an email belongs to an active subscriber.
 * Active means: status is 'active' or 'trial' (not expired).
 */
export async function isActiveSubscriber(email: string): Promise<boolean> {
  const subscriber = await findSubscriberByEmail(email);

  if (!subscriber) {
    return false;
  }

  // Active subscription
  if (subscriber.status === 'active') {
    return true;
  }

  // Trial - check if not expired
  if (subscriber.status === 'trial' && subscriber.trialEndsAt) {
    return new Date() < subscriber.trialEndsAt;
  }

  return false;
}

/**
 * Get all products a subscriber has access to.
 */
export async function getSubscriberProducts(
  email: string
): Promise<string[]> {
  const subscriber = await findSubscriberByEmail(email);
  return subscriber?.products || [];
}

/**
 * Create or update a subscriber record.
 * Used by Stripe webhook to sync subscription data.
 */
export async function upsertSubscriber(
  data: Omit<Subscriber, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = adminDb();
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check if subscriber exists
  const existing = await findSubscriberByEmail(normalizedEmail);

  const now = new Date();
  const subscriberData = {
    ...data,
    email: normalizedEmail,
    updatedAt: now,
  };

  if (existing) {
    await db.collection('subscribers').doc(existing.id).update(subscriberData);
    return existing.id;
  } else {
    const docRef = await db.collection('subscribers').add({
      ...subscriberData,
      createdAt: now,
    });
    return docRef.id;
  }
}
