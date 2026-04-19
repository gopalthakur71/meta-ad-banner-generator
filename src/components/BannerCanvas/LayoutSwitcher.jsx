const LAYOUTS = [
  { id: 'overlay', label: 'Overlay' },
  { id: 'centered', label: 'Centered' },
  { id: 'left-aligned', label: 'Left Align' },
  { id: 'minimal', label: 'Minimal' },
]

export default function LayoutSwitcher({ layout, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LAYOUTS.map(l => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            layout === l.id
              ? 'bg-rose-900/60 border-rose-700 text-rose-300'
              : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
