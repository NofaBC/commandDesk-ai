import type { EmailClassification } from '@/types';
import { PRODUCT_REGISTRY, getProduct, type ProductDefinition } from '@/lib/products/registry';
import { detectExplicitProducts } from '@/lib/products/identify';

/**
 * Prospect inquiry support (registry opt-in).
 *
 * By default CommandDesk replies to anyone who is not an active subscriber with
 * the standard "inbox reserved for subscribers" redirect. Products that set
 * `prospectInquiries: true` in the product registry may instead answer
 * pre-sales / how-it-works / pricing questions from non-subscribers using the
 * product knowledge base. Technical, account and non-pricing billing issues from
 * non-subscribers keep the standard redirect.
 */

/** Intents a prospect-enabled product may answer for a non-subscriber. */
const PROSPECT_INTENTS = new Set(['sales', 'general', 'feature_request']);

/**
 * Cheap, no-LLM pre-filter: which prospect-enabled products does this text
 * appear to concern? Used so non-subscriber mail unrelated to any such product
 * takes exactly the same path as before (no extra classification call).
 */
export function getProspectCandidateProducts(text: string): ProductDefinition[] {
  const enabled = PRODUCT_REGISTRY.filter((p) => p.prospectInquiries);
  if (enabled.length === 0 || !text) return [];

  const named = new Set(detectExplicitProducts(text).map((p) => p.slug));
  const lower = text.toLowerCase();

  return enabled.filter(
    (p) =>
      named.has(p.slug) ||
      (p.keywords ?? []).some((k) => lower.includes(k.toLowerCase()))
  );
}

/**
 * Given the AI classification of a non-subscriber email, may it be answered
 * from the product knowledge base instead of receiving the redirect?
 */
export function isProspectEligible(classification: EmailClassification): boolean {
  const product = getProduct(classification.product);
  if (!product?.prospectInquiries) return false;
  if (classification.severity === 'critical') return false;

  if (PROSPECT_INTENTS.has(classification.intent)) return true;

  // Pricing questions are often classified as billing.
  return (
    classification.intent === 'billing' &&
    classification.issueCategory === 'pricing_question'
  );
}
