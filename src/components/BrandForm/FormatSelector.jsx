import { AD_FORMATS, FORMAT_CATEGORIES } from '../../constants/formats'

export default function FormatSelector({ selectedFormat, onSelect }) {
  return (
    <div className="space-y-3">
      {FORMAT_CATEGORIES.map(cat => (
        <div key={cat}>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">{cat}</p>
          <div className="grid grid-cols-2 gap-2">
            {AD_FORMATS.filter(f => f.category === cat).map(fmt => (
              <button
                key={fmt.id}
                onClick={() => onSelect(fmt)}
                className={`text-left p-3 rounded-lg border text-xs transition-all ${
                  selectedFormat.id === fmt.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold">{fmt.label}</div>
                <div className="text-gray-500 mt-0.5">{fmt.width}×{fmt.height}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
