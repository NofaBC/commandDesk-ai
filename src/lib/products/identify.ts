import {
  getClassifiableProducts,
  getProduct,
  type ProductDefinition,
} from './registry';

/**
 * Product identification helpers built on the NOFA Product Registry.
 * Pure functions (no I/O) so they are fast and unit-testable.
 */

// ── Alias matching ───────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whitespace/hyphen-tolerant, word-bounded regex for one alias. */
function aliasRegex(alias: string): RegExp {
  const body = alias
    .trim()
    .split(/[\s-]+/)
    .map(escapeRegex)
    .join('[\\s-]*');
  return new RegExp(`(?<![a-z0-9])${body}(?![a-z0-9])`, 'i');
}

const aliasRegexCache = new Map<string, RegExp[]>();

function regexesFor(product: ProductDefinition): RegExp[] {
  let cached = aliasRegexCache.get(product.slug);
  if (!cached) {
    cached = product.aliases.map(aliasRegex);
    aliasRegexCache.set(product.slug, cached);
  }
  return cached;
}

/**
 * Return every classifiable product explicitly named in the text
 * (by name or known alias). Order follows the registry.
 */
export function detectExplicitProducts(text: string): ProductDefinition[] {
  if (!text) return [];
  return getClassifiableProducts().filter((p) =>
    regexesFor(p).some((re) => re.test(text))
  );
}

// ── Slug canonicalization ────────────────────────────────────────────────────

/**
 * Map a model-emitted product string onto a canonical registry slug.
 * Recognized slugs/legacy slugs/names/aliases are canonicalized; anything else
 * is returned unchanged (existing behavior), and empty values become 'unknown'.
 */
export function canonicalizeProductSlug(raw: string | null | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return 'unknown';
  if (value.toLowerCase() === 'unknown') return 'unknown';

  const bySlug = getProduct(value);
  if (bySlug) return bySlug.slug;

  const normalized = value.replace(/[™®]/g, '').trim();
  const exact = getClassifiableProducts().find(
    (p) =>
      p.name.replace(/[™®]/g, '').toLowerCase() === normalized.toLowerCase() ||
      regexesFor(p).some((re) => {
        const m = normalized.match(re);
        return !!m && m[0].length === normalized.length;
      })
  );
  return exact ? exact.slug : value;
}

/**
 * Safety net applied after LLM classification.
 *
 * Only when the model could not decide (product "unknown" or low confidence)
 * AND the email explicitly names exactly one registered product, use that
 * product. Never overrides a confident model decision.
 */
export function resolveProduct(
  modelProduct: string | null | undefined,
  confidence: number,
  text: string
): { product: string; source: 'model' | 'explicit-name' } {
  const canonical = canonicalizeProductSlug(modelProduct);
  const undecided = canonical === 'unknown' || confidence < 0.6;

  if (undecided) {
    const named = detectExplicitProducts(text);
    if (named.length === 1 && named[0].slug !== canonical) {
      return { product: named[0].slug, source: 'explicit-name' };
    }
  }
  return { product: canonical, source: 'model' };
}

// ── Classifier prompt builder ────────────────────────────────────────────────

/** Render the product list section of the classifier system prompt. */
export function buildClassifierProductList(): string {
  return getClassifiableProducts()
    .map((p, i) => {
      const former = p.formerNames?.length
        ? ` — formerly known as ${p.formerNames.join(', ')}`
        : '';
      const lines = [
        `${i + 1}. **${p.name}** (slug: ${p.slug})${former}`,
        ...(p.classifierDescription ?? []).map((l) => `   - ${l}`),
        ...(p.keywords?.length ? [`   - Keywords: ${p.keywords.join(', ')}`] : []),
        ...(p.classifierNotes ?? []).map((l) => `   - ${l}`),
      ];
      return lines.join('\n');
    })
    .join('\n\n');
}

/** Render global disambiguation rules contributed by registry entries. */
export function buildClassifierRules(): string {
  return getClassifiableProducts()
    .flatMap((p) => p.classifierRules ?? [])
    .join('\n');
}
