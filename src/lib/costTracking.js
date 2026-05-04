import { MODEL_PRICING, FALLBACK_PRICING } from '../constants/pricing'

const STORAGE_KEY = 'banner_cost_records_v1'
const DOWNLOAD_KEY = 'banner_download_records_v1'

// ---------- Cost calculation ----------

// Compute USD cost for a single API call given model + token counts.
export function calculateCost({ model, inputTokens, outputTokens }) {
  const rates = MODEL_PRICING[model] || FALLBACK_PRICING
  const input = (inputTokens || 0) * rates.inputPerMillion / 1_000_000
  const output = (outputTokens || 0) * rates.outputPerMillion / 1_000_000
  return input + output
}

// ---------- Generation records (one row per API call) ----------

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
    console.warn('Cost tracking: failed to persist record', e)
  }
}

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

// ---------- Download records (one row per Download PNG click) ----------

export function getAllDownloads() {
  try {
    const raw = localStorage.getItem(DOWNLOAD_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAllDownloads(records) {
  try {
    localStorage.setItem(DOWNLOAD_KEY, JSON.stringify(records))
  } catch (e) {
    console.warn('Cost tracking: failed to persist download record', e)
  }
}

export function recordDownload({ bannerId, filename, formatId, productName, timestamp = Date.now() }) {
  const record = {
    id: makeId(),
    bannerId,
    filename: filename || 'banner.png',
    formatId: formatId || '',
    productName: productName || '(untitled)',
    timestamp,
  }
  const all = getAllDownloads()
  all.push(record)
  writeAllDownloads(all)
  return record
}

export function getDownloadsForBanner(bannerId, downloads = getAllDownloads()) {
  return downloads
    .filter(d => d.bannerId === bannerId)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function clearAllDownloads() {
  try {
    localStorage.removeItem(DOWNLOAD_KEY)
  } catch {
    // ignore
  }
}

// ---------- Aggregations ----------

// Group records by bannerId and roll up. Sorted by most recent banner first.
// Includes downloads for each banner.
export function getBannerSummaries(records = getAllRecords(), downloads = getAllDownloads()) {
  const byBanner = new Map()
  for (const r of records) {
    if (!byBanner.has(r.bannerId)) {
      byBanner.set(r.bannerId, {
        bannerId: r.bannerId,
        productName: r.productName,
        formatId: r.formatId,
        generations: [],
        downloads: [],
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
    if (r.productName && r.productName !== '(untitled)') b.productName = r.productName
    if (r.formatId) b.formatId = r.formatId
  }
  // Attach downloads. A download might exist for a banner that has zero
  // generations (impossible in practice — you can't download without copy —
  // but be defensive). Only attach to banners that exist in the records.
  for (const d of downloads) {
    const b = byBanner.get(d.bannerId)
    if (!b) continue
    b.downloads.push(d)
    b.lastAt = Math.max(b.lastAt, d.timestamp)
    if (d.productName && d.productName !== '(untitled)') b.productName = d.productName
  }
  const summaries = Array.from(byBanner.values())
  for (const b of summaries) {
    b.generations.sort((a, b) => b.timestamp - a.timestamp)
    b.downloads.sort((a, b) => b.timestamp - a.timestamp)
  }
  summaries.sort((a, b) => b.lastAt - a.lastAt)
  return summaries
}

export function getTotalSpend(records = getAllRecords()) {
  return records.reduce((sum, r) => sum + r.cost, 0)
}

export function getBannerSpend(bannerId, records = getAllRecords()) {
  return records
    .filter(r => r.bannerId === bannerId)
    .reduce((sum, r) => sum + r.cost, 0)
}

export function clearAllRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(DOWNLOAD_KEY)
  } catch {
    // ignore
  }
}

// ---------- Helpers ----------

export function makeBannerId() {
  return makeId()
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

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
