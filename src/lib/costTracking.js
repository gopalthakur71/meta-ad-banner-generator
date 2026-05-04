import { MODEL_PRICING, FALLBACK_PRICING } from '../constants/pricing'

const STORAGE_KEY = 'banner_cost_records_v1'

// Compute USD cost for a single API call given model + token counts.
export function calculateCost({ model, inputTokens, outputTokens }) {
  const rates = MODEL_PRICING[model] || FALLBACK_PRICING
  const input = (inputTokens || 0) * rates.inputPerMillion / 1_000_000
  const output = (outputTokens || 0) * rates.outputPerMillion / 1_000_000
  return input + output
}

// Read all records from localStorage. Returns [] if nothing stored or corrupt.
export function getAllRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (e) {
    // localStorage full or disabled — fail silently, don't crash the app.
    console.warn('Cost tracking: failed to persist record', e)
  }
}

// Append a generation record. Returns the saved record so callers can
// pass it onward (e.g. to update UI immediately).
export function recordGeneration({
  bannerId,
  productName,
  formatId,
  model,
  inputTokens,
  outputTokens,
  timestamp = Date.now(),
}) {
  const cost = calculateCost({ model, inputTokens, outputTokens })
  const record = {
    id: makeId(),
    bannerId,
    productName: productName || '(untitled)',
    formatId,
    model,
    inputTokens: inputTokens || 0,
    outputTokens: outputTokens || 0,
    cost,
    timestamp,
  }
  const all = getAllRecords()
  all.push(record)
  writeAll(all)
  return record
}

// Group records by bannerId and roll up. Sorted by most recent banner first.
export function getBannerSummaries(records = getAllRecords()) {
  const byBanner = new Map()
  for (const r of records) {
    if (!byBanner.has(r.bannerId)) {
      byBanner.set(r.bannerId, {
        bannerId: r.bannerId,
        productName: r.productName,
        formatId: r.formatId,
        generations: [],
        totalCost: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        firstAt: r.timestamp,
        lastAt: r.timestamp,
      })
    }
    const b = byBanner.get(r.bannerId)
    b.generations.push(r)
    b.totalCost += r.cost
    b.totalInputTokens += r.inputTokens
    b.totalOutputTokens += r.outputTokens
    b.firstAt = Math.min(b.firstAt, r.timestamp)
    b.lastAt = Math.max(b.lastAt, r.timestamp)
    // Keep latest non-empty productName (user may have renamed mid-session).
    if (r.productName && r.productName !== '(untitled)') b.productName = r.productName
    if (r.formatId) b.formatId = r.formatId
  }
  // Sort each banner's generations newest-first, then sort banners by lastAt desc.
  const summaries = Array.from(byBanner.values())
  for (const b of summaries) b.generations.sort((a, b) => b.timestamp - a.timestamp)
  summaries.sort((a, b) => b.lastAt - a.lastAt)
  return summaries
}

// Convenience aggregate over all records.
export function getTotalSpend(records = getAllRecords()) {
  return records.reduce((sum, r) => sum + r.cost, 0)
}

// Total spend for a single banner session.
export function getBannerSpend(bannerId, records = getAllRecords()) {
  return records
    .filter(r => r.bannerId === bannerId)
    .reduce((sum, r) => sum + r.cost, 0)
}

export function clearAllRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function makeBannerId() {
  return makeId()
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Pretty-print a USD cost. Sub-cent values get extra precision so the user
// can see "$0.0042" rather than rounding everything to "$0.00".
export function formatUsd(amount) {
  if (amount == null || isNaN(amount)) return '$0.00'
  if (amount === 0) return '$0.00'
  if (amount < 0.01) return `$${amount.toFixed(4)}`
  if (amount < 1) return `$${amount.toFixed(3)}`
  return `$${amount.toFixed(2)}`
}

export function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
