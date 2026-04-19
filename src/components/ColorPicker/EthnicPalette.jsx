import { ETHNIC_PALETTES } from '../../constants/palettes'

export default function EthnicPalette({ activePaletteId, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ETHNIC_PALETTES.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          title={p.label}
          className={`rounded-lg overflow-hidden border-2 transition-all ${
            activePaletteId === p.id ? 'border-amber-500 scale-105' : 'border-transparent hover:border-gray-600'
          }`}
        >
          <div className="flex h-8">
            <div className="flex-1" style={{ background: p.primary }} />
            <div className="flex-1" style={{ background: p.accent }} />
            <div className="flex-1" style={{ background: p.background }} />
          </div>
          <div className="bg-gray-800 text-gray-400 text-xs py-1 truncate px-1">{p.label}</div>
        </button>
      ))}
    </div>
  )
}
