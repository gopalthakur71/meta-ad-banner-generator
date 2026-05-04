// Anthropic API pricing per model.
// Rates are USD per 1,000,000 tokens.
//
// IMPORTANT: Anthropic adjusts pricing occasionally. If you notice the
// in-app cost diverging from your Anthropic Console bill, update the
// figures below and bump the date.
//
// Rates as of 2026-05-04. Source: https://www.anthropic.com/pricing
export const MODEL_PRICING = {
  'claude-sonnet-4-6': { inputPerMillion: 3, outputPerMillion: 15 },
  'claude-opus-4-6':   { inputPerMillion: 15, outputPerMillion: 75 },
  'claude-haiku-4-5':  { inputPerMillion: 1, outputPerMillion: 5 },
}

export const PRICING_AS_OF = '2026-05-04'

// Fallback used when a record's model isn't in the table above
// (e.g. Anthropic releases a new model and we haven't updated yet).
// Returns 0 cost rather than throwing — better to under-report than crash.
export const FALLBACK_PRICING = { inputPerMillion: 0, outputPerMillion: 0 }
