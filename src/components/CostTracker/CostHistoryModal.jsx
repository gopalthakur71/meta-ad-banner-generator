import { useEffect, useMemo, useState } from 'react'
import {
  getAllRecords,
  getBannerSummaries,
  getTotalSpend,
  clearAllRecords,
  formatUsd,
  formatTimestamp,
} from '../../lib/costTracking'
import { PRICING_AS_OF, MODEL_PRICING } from '../../constants/pricing'

export default function CostHistoryModal({ onClose, currentBannerId }) {
  const [version, setVersion] = useState(0)
  const [expanded, setExpanded] = useState(() => new Set(currentBannerId ? [currentBannerId] : []))
  const [confirmingClear, setConfirmingClear] = useState(false)

  const { records, summaries, totalSpend } = useMemo(() => {
    const records = getAllRecords()
    return {
      records,
      summaries: getBannerSummaries(records),
      totalSpend: getTotalSpend(records),
    }
  }, [version])

  // Close on Escape for keyboard users.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              API Cost History
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {records.length} generation{records.length === 1 ? '' : 's'} across {summaries.length} banner{summaries.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Total spend</p>
              <p className="text-lg font-mono tabular-nums text-emerald-400">{formatUsd(totalSpend)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors p-1"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {summaries.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No generations recorded yet. Cost will start tracking from your next "Generate Caption" click.
            </div>
          )}
          {summaries.map(b => {
            const isOpen = expanded.has(b.bannerId)
            const isCurrent = b.bannerId === currentBannerId
            return (
              <div key={b.bannerId} className={`border-b border-gray-800 ${isCurrent ? 'bg-emerald-900/10' : ''}`}>
                <button
                  onClick={() => toggleExpanded(b.bannerId)}
                  className="w-full px-6 py-3 flex items-center gap-4 text-left hover:bg-gray-800/40 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-gray-100 truncate">{b.productName}</span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-800/60">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {b.formatId} · {b.generations.length} generation{b.generations.length === 1 ? '' : 's'} · {formatTimestamp(b.lastAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono tabular-nums text-emerald-400">{formatUsd(b.totalCost)}</p>
                    <p className="text-[10px] text-gray-600">{b.totalInputTokens.toLocaleString()} in / {b.totalOutputTokens.toLocaleString()} out</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pl-14 space-y-1.5">
                    {b.generations.map(g => (
                      <div key={g.id} className="flex items-center gap-3 text-xs py-1.5 border-l-2 border-gray-800 pl-3">
                        <span className="text-gray-500 w-32 flex-shrink-0">{formatTimestamp(g.timestamp)}</span>
                        <span className="text-gray-400 flex-1 truncate font-mono text-[11px]">{g.model}</span>
                        <span className="text-gray-500 tabular-nums">{g.inputTokens.toLocaleString()} in</span>
                        <span className="text-gray-500 tabular-nums">{g.outputTokens.toLocaleString()} out</span>
                        <span className="text-emerald-400 font-mono tabular-nums w-16 text-right">{formatUsd(g.cost)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between gap-4 bg-gray-950/40">
          <div className="text-[10px] text-gray-600 leading-tight">
            <p>Pricing as of {PRICING_AS_OF}.</p>
            <p>
              {Object.entries(MODEL_PRICING).map(([model, r], i) => (
                <span key={model}>
                  {i > 0 ? ' · ' : ''}
                  <span className="font-mono">{model}</span> ${r.inputPerMillion}/M in, ${r.outputPerMillion}/M out
                </span>
              ))}
            </p>
          </div>
          {records.length > 0 && (
            confirmingClear ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">Erase all history?</span>
                <button
                  onClick={handleClear}
                  className="text-xs px-2.5 py-1 rounded-md bg-rose-700 hover:bg-rose-600 text-white font-semibold transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  className="text-xs px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingClear(true)}
                className="text-xs px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
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
