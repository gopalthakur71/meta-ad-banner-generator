import { useRef, useEffect } from 'react'
import { renderBanner } from '../../lib/canvasRenderer'
import LayoutSwitcher from './LayoutSwitcher'

export default function BannerCanvas({ state }) {
  const canvasRef = useRef()
  const { selectedFormat, productImg, logoImg, copy, activePalette, layout, setLayout, brandName } = state

  useEffect(() => {
    if (!copy) return
    const canvas = canvasRef.current
    if (!canvas) return

    // Load fonts before drawing
    document.fonts.ready.then(() => {
      renderBanner(canvas, {
        format: selectedFormat,
        productImg,
        logoImg,
        copy,
        palette: activePalette,
        layout,
        brandName,
      })
    })
  }, [copy, selectedFormat, productImg, logoImg, activePalette, layout, brandName])

  // Scale canvas display to fit container
  const maxDisplayW = 560
  const scale = Math.min(1, maxDisplayW / selectedFormat.width)
  const displayW = Math.round(selectedFormat.width * scale)
  const displayH = Math.round(selectedFormat.height * scale)

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${brandName || 'banner'}-${selectedFormat.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Format info */}
      <div className="flex items-center gap-3 self-start">
        <span className="text-sm font-semibold text-gray-200">{selectedFormat.label}</span>
        <span className="text-xs text-gray-500">{selectedFormat.width} × {selectedFormat.height} px</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">{selectedFormat.description}</span>
      </div>

      {/* Layout switcher */}
      <div className="self-start">
        <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider font-semibold">Layout</p>
        <LayoutSwitcher layout={layout} onChange={setLayout} />
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800"
        style={{ width: displayW, height: displayH }}
      >
        {!copy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-600 gap-3">
            <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Fill in your details and click Generate</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: displayW, height: displayH, display: copy ? 'block' : 'none' }}
        />
      </div>

      {/* Download */}
      {copy && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </button>
      )}
    </div>
  )
}
