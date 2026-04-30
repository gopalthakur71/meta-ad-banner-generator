import EthnicPalette from './EthnicPalette'

export default function ColorPicker({ state }) {
  const { palette, setPalette, customPrimary, setCustomPrimary, customAccent, setCustomAccent, customTextColor, setCustomTextColor } = state

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Ethnic Palettes</p>
        <EthnicPalette
          activePaletteId={palette.id}
          onSelect={p => { setPalette(p); setCustomPrimary(p.primary); setCustomAccent(p.accent) }}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1.5">Primary Color</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customPrimary}
              onChange={e => setCustomPrimary(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-gray-800"
            />
            <span className="text-xs text-gray-400 font-mono">{customPrimary}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1.5">Accent Color</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customAccent}
              onChange={e => setCustomAccent(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-gray-800"
            />
            <span className="text-xs text-gray-400 font-mono">{customAccent}</span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Font / Text Color</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customTextColor}
            onChange={e => setCustomTextColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-700 bg-gray-800"
          />
          <span className="text-xs text-gray-400 font-mono">{customTextColor}</span>
        </div>
      </div>
    </div>
  )
}
