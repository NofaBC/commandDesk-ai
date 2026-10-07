// Imported FIRST by scripts/test-product-registry.ts.
// The classifier/responder modules construct an OpenAI client at import time and
// throw without a key. This placeholder lets the offline suite import them; no
// network request is ever made by the offline suite.
process.env.OPENAI_API_KEY ||= 'offline-test-placeholder';

export {};
