import { TONES } from '../../constants/palettes'

export default function TonePicker({ tone, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            tone === t.id
              ? 'bg-rose-900 border-rose-600 text-rose-200'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
