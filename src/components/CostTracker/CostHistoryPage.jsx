import { useMemo, useState } from 'react'
import {
  getAllRecords,
  getAllDownloads,
  getBannerSummaries,
  getTotalSpend,
  clearAllRecords,
  formatUsd,
  formatTimestamp,
} from '../../lib/costTracking'
import { PRICING_AS_OF, MODEL_PRICING } from '../../constants/pricing'

export default function CostHistoryPage({ onBack, currentBannerId }) {
  // Bumped on Clear-history action so the memoized data refreshes.
  const [version, setVersion] = useState(0)
  const [expanded, setExpanded] = useState(() => new Set(currentBannerId ? [currentBannerId] : []))
  const [confirmingClear, setConfirmingClear] = useState(false)

  const { records, downloads, summaries, totalSpend, totalDownloads } = useMemo(() => {
    const records = getAllRecords()
    const downloads = getAllDownloads()
    return {
      records,
      downloads,
      summaries: getBannerSummaries(records, downloads),
      totalSpend: getTotalSpend(records),
      totalDownloads: downloads.length,
    }
  }, [version])

  function toggleExpanded(bannerId) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(bannerId)) next.delete(bannerId)
      else next.add(bannerId)
      return next
    })
  }

  function handleClear() {
    clearAllRecords()
    setConfirmingClear(false)
    setVersion(v => v + 1)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Page header — distinct from app header so the Back button is unmissable */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Editor
            </button>
            <div>
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                API Cost History
              </h1>
              <p className="text-xs text-gray-500">
                {records.length} generation{records.length === 1 ? '' : 's'} · {totalDownloads} download{totalDownloads === 1 ? '' : 's'} · {summaries.length} banner{summaries.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Total spend</p>
              <p className="text-2xl font-mono tabular-nums text-emerald-400">{formatUsd(totalSpend)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {summaries.length === 0 && (
            <div className="p-16 text-center text-gray-500 text-sm">
              <svg className="w-14 h-14 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-base text-gray-400 mb-1">No generations recorded yet</p>
              <p className="text-xs">Cost will start tracking from your next "Generate Caption" click.</p>
            </div>
          )}
          {summaries.map(b => {
            const isOpen = expanded.has(b.bannerId)
            const isCurrent = b.bannerId === currentBannerId
            return (
              <div key={b.bannerId} className={`border-b border-gray-800 last:border-b-0 ${isCurrent ? 'bg-emerald-900/10' : ''}`}>
                <button
                  onClick={() => toggleExpanded(b.bannerId)}
                  className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-800/40 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold text-gray-100 truncate">{b.productName}</span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-800/60">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-mono">{b.formatId}</span> ·
                      <span> {b.generations.length} generation{b.generations.length === 1 ? '' : 's'}</span> ·
                      <span> {b.downloads.length} download{b.downloads.length === 1 ? '' : 's'}</span> ·
                      <span> {formatTimestamp(b.lastAt)}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-mono tabular-nums text-emerald-400">{formatUsd(b.totalCost)}</p>
                    <p className="text-[10px] text-gray-600">{b.totalInputTokens.toLocaleString()} in / {b.totalOutputTokens.toLocaleString()} out</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pl-14">
                    {/* Generations */}
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 mt-1">Generations</p>
                    <div className="space-y-1 mb-4">
                      {b.generations.map(g => (
                        <div key={g.id} className="flex items-center gap-3 text-xs py-1.5 border-l-2 border-gray-800 pl-3">
                          <span className="text-gray-500 w-32 flex-shrink-0">{formatTimestamp(g.timestamp)}</span>
                          <span className="text-gray-400 flex-1 truncate font-mono text-[11px]">{g.model}</span>
                          <span className="text-gray-500 tabular-nums">{g.inputTokens.toLocaleString()} in</span>
                          <span className="text-gray-500 tabular-nums">{g.outputTokens.toLocaleString()} out</span>
                          <span className="text-emerald-400 font-mono tabular-nums w-20 text-right">{formatUsd(g.cost)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Downloads */}
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Downloaded files</p>
                    {b.downloads.length === 0 ? (
                      <p className="text-xs text-gray-600 italic pl-3 border-l-2 border-gray-800">No downloads yet for this banner.</p>
                    ) : (
                      <div className="space-y-1">
                        {b.downloads.map(d => (
                          <div key={d.id} className="flex items-center gap-3 text-xs py-1.5 border-l-2 border-amber-900/50 pl-3">
                            <span className="text-gray-500 w-32 flex-shrink-0">{formatTimestamp(d.timestamp)}</span>
                            <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-amber-300 font-mono text-[11px] truncate flex-1">{d.filename}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Pricing reference + clear */}
        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="text-[11px] text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-1">Pricing reference</p>
            <p>Rates as of {PRICING_AS_OF}.</p>
            {Object.entries(MODEL_PRICING).map(([model, r]) => (
              <p key={model}>
                <span className="font-mono text-gray-500">{model}</span> — ${r.inputPerMillion}/M in, ${r.outputPerMillion}/M out
              </p>
            ))}
          </div>
          {(records.length > 0 || downloads.length > 0) && (
            confirmingClear ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">Erase all history?</span>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-600 text-white font-semibold transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingClear(true)}
                className="text-xs px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
              >
                Clear history
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
