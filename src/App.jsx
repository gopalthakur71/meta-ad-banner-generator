import { useBannerState } from './hooks/useBannerState'
import { useClaudeGenerate } from './hooks/useClaudeGenerate'
import BrandForm from './components/BrandForm/BrandForm'
import AssetUploader from './components/AssetUploader/AssetUploader'
import ColorPicker from './components/ColorPicker/ColorPicker'
import BannerCanvas from './components/BannerCanvas/BannerCanvas'
import Toolbar from './components/Toolbar/Toolbar'
import CopyEditor from './components/CopyEditor/CopyEditor'
import FontPicker from './components/FontPicker/FontPicker'

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
      <span className="flex-1 h-px bg-gray-800" />
      {children}
      <span className="flex-1 h-px bg-gray-800" />
    </h3>
  )
}

export default function App() {
  const state = useBannerState()
  const { generate, loading, error } = useClaudeGenerate()

  const canGenerate = !!(state.productName && state.productDescription)

  function handleGenerate() {
    generate({
      productName: state.productName,
      productDescription: state.productDescription,
      tone: state.tone,
      formatId: state.selectedFormat.id,
      setCopy: state.setCopy,
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Meta Ad Banner Generator
            </h1>
            <p className="text-xs text-gray-500">AI-Powered · Ethnic & Saree Brands</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={state.changePhoto}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Change Photo
            </button>
            <button
              onClick={state.newProduct}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-900/50 border border-rose-800 text-rose-300 hover:bg-rose-800 hover:text-white transition-colors"
            >
              New Product
            </button>
            <span className="text-xs px-3 py-1 rounded-full bg-rose-900/40 border border-rose-800 text-rose-400">
              Powered by Claude
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">
        <aside className="w-80 flex-shrink-0 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)', position: 'sticky', top: 72 }}>
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <SectionTitle>Product Details</SectionTitle>
            <BrandForm state={state} onGenerate={handleGenerate} loading={loading} canGenerate={canGenerate} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <SectionTitle>Assets</SectionTitle>
            <AssetUploader state={state} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <SectionTitle>Typography</SectionTitle>
            <FontPicker value={state.headlineFont} onChange={state.setHeadlineFont} />
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-gray-500">Headline Size</p>
                  <p className="text-xs text-gray-400">{Math.round(state.headlineFontSize * 100)}%</p>
                </div>
                <input
                  type="range" min={0.6} max={1.8} step={0.05}
                  value={state.headlineFontSize}
                  onChange={e => state.setHeadlineFontSize(parseFloat(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-gray-500">Subheadline Size</p>
                  <p className="text-xs text-gray-400">{Math.round(state.subFontSize * 100)}%</p>
                </div>
                <input
                  type="range" min={0.6} max={1.8} step={0.05}
                  value={state.subFontSize}
                  onChange={e => state.setSubFontSize(parseFloat(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <SectionTitle>Colors</SectionTitle>
            <ColorPicker state={state} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <SectionTitle>Ad Copy</SectionTitle>
            <CopyEditor copy={state.copy} setCopy={state.setCopy} />
          </div>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <Toolbar
              onGenerate={handleGenerate}
              onRegenerate={handleGenerate}
              loading={loading}
              hasCopy={!!state.copy}
              canGenerate={canGenerate}
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
        </aside>

        <main className="flex-1 bg-gray-900 rounded-2xl p-8 border border-gray-800 flex items-start justify-center min-h-96">
          <BannerCanvas state={state} />
        </main>
      </div>
    </div>
  )
}
