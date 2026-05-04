import { useMemo } from 'react'
import { getAllRecords, getTotalSpend, getBannerSpend, formatUsd } from '../../lib/costTracking'

export default function CostChip({ bannerId, recordVersion = 0, onOpenHistory }) {
  // Re-read on every recordVersion bump (a new generation just landed).
  const { totalSpend, bannerSpend, generationCount } = useMemo(() => {
    const records = getAllRecords()
    return {
      totalSpend: getTotalSpend(records),
      bannerSpend: bannerId ? getBannerSpend(bannerId, records) : 0,
      generationCount: records.length,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerId, recordVersion])

  return (
    <button
      onClick={onOpenHistory}
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-800/70 text-emerald-300 hover:bg-emerald-800/60 hover:text-emerald-200 transition-colors"
      title={`API spend tracker — click to see history. ${generationCount} generation${generationCount === 1 ? '' : 's'} recorded.`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-mono tabular-nums">{formatUsd(bannerSpend)}</span>
      <span className="text-emerald-500/80 text-[10px] uppercase tracking-wider">this banner</span>
      {totalSpend > 0 && totalSpend !== bannerSpend && (
        <span className="text-emerald-500/60 text-[10px] border-l border-emerald-800/60 pl-2 ml-1">
          {formatUsd(totalSpend)} all-time
        </span>
      )}
    </button>
  )
}
