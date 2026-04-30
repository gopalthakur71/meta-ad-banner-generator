const FONTS = [
  { name: 'Playfair Display', label: 'Playfair', style: 'serif' },
  { name: 'Cormorant Garamond', label: 'Cormorant', style: 'serif' },
  { name: 'Libre Baskerville', label: 'Baskerville', style: 'serif' },
  { name: 'Montserrat', label: 'Montserrat', style: 'sans' },
]

export default function FontPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FONTS.map(f => (
        <button
          key={f.name}
          onClick={() => onChange(f.name)}
          className={`px-3 py-3 rounded-xl border text-left transition-colors ${
            value === f.name
              ? 'border-amber-600 bg-amber-600/10 text-amber-400'
              : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
          }`}
        >
          <span className="block text-xs text-gray-500 mb-0.5 font-mono">{f.style}</span>
          <span style={{ fontFamily: f.name }} className="text-base leading-tight">
            {f.label}
          </span>
        </button>
      ))}
    </div>
  )
}
