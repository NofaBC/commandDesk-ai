import { findSubscriberByEmail } from '@/lib/firebase/subscribers';
import type { SubscriberVerificationResult } from '@/types';

/**
 * Verify if an email address belongs to an active subscriber.
 * 
 * Returns detailed verification result including:
 * - isSubscriber: boolean
 * - subscriber: full subscriber data if found
 * - reason: why access was granted or denied
 */
export async function verifySubscriber(
  email: string
): Promise<SubscriberVerificationResult> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const subscriber = await findSubscriberByEmail(normalizedEmail);

    // Not found in database
    if (!subscriber) {
      console.log(`Subscriber not found: ${normalizedEmail}`);
      return {
        isSubscriber: false,
        reason: 'not_found',
      };
    }

    // Check subscription status
    switch (subscriber.status) {
      case 'active':
        return {
          isSubscriber: true,
          subscriber,
          reason: 'active',
        };

      case 'trial':
        // Check if trial has expired
        if (subscriber.trialEndsAt && new Date() > subscriber.trialEndsAt) {
          console.log(`Trial expired for: ${normalizedEmail}`);
          return {
            isSubscriber: false,
            subscriber,
            reason: 'expired',
          };
        }
        return {
          isSubscriber: true,
          subscriber,
          reason: 'trial',
        };

      case 'cancelled':
        // Check if they still have time left in their billing period
        if (subscriber.currentPeriodEnd && new Date() < subscriber.currentPeriodEnd) {
          return {
            isSubscriber: true,
            subscriber,
            reason: 'active', // Still within paid period
          };
        }
        console.log(`Subscription cancelled: ${normalizedEmail}`);
        return {
          isSubscriber: false,
          subscriber,
          reason: 'cancelled',
        };

      case 'past_due':
      case 'unpaid':
        console.log(`Subscription ${subscriber.status}: ${normalizedEmail}`);
        return {
          isSubscriber: false,
          subscriber,
          reason: 'expired',
        };

      default:
        console.log(`Unknown status for ${normalizedEmail}: ${subscriber.status}`);
        return {
          isSubscriber: false,
          subscriber,
          reason: 'not_found',
        };
    }
  } catch (error) {
    console.error('Subscriber verification error:', error);
    // On error, deny access to be safe
    return {
      isSubscriber: false,
      reason: 'not_found',
    };
  }
}

/**
 * Check if subscriber has access to a specific product.
 */
export async function hasProductAccess(
  email: string,
  product: string
): Promise<boolean> {
  const result = await verifySubscriber(email);

  if (!result.isSubscriber || !result.subscriber) {
    return false;
  }

  // If products array is empty, assume access to all
  if (result.subscriber.products.length === 0) {
    return true;
  }

  const normalizedProduct = product.toLowerCase().trim();
  return result.subscriber.products.some(
    (p) => p.toLowerCase().trim() === normalizedProduct
  );
}
