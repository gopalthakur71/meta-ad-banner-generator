import DropZone from './DropZone'

export default function AssetUploader({ state }) {
  const {
    productSrc, setProductAsset, clearProductAsset,
    logoSrc, setLogoAsset, clearLogoAsset,
    logoVisible, setLogoVisible,
    logoOpacity, setLogoOpacity,
    logoScale, setLogoScale,
  } = state

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Product Photo</p>
        <DropZone
          label="Product / Model Photo"
          preview={productSrc}
          onFile={setProductAsset}
          onClear={clearProductAsset}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Brand Logo</p>
        <DropZone
          label="Brand Logo (PNG preferred)"
          preview={logoSrc}
          onFile={setLogoAsset}
          onClear={clearLogoAsset}
        />

        {logoSrc && (
          <div className="mt-3 space-y-3 bg-gray-800/50 rounded-xl p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Visible</span>
              <button
                onClick={() => setLogoVisible(v => !v)}
                className={`w-8 h-4 rounded-full transition-colors relative ${logoVisible ? 'bg-amber-600' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${logoVisible ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-gray-500">Opacity</p>
                <p className="text-xs text-gray-400">{Math.round(logoOpacity * 100)}%</p>
              </div>
              <input
                type="range" min={0} max={1} step={0.05}
                value={logoOpacity}
                onChange={e => setLogoOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-xs text-gray-400">{Math.round(logoScale * 100)}%</p>
              </div>
              <input
                type="range" min={0.4} max={2.5} step={0.05}
                value={logoScale}
                onChange={e => setLogoScale(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <p className="text-xs text-gray-600">Drag logo on canvas to reposition</p>
          </div>
        )}
      </div>
    </div>
  )
}
