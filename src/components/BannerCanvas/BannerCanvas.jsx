import { useRef, useEffect, useState } from 'react'
import { renderBanner } from '../../lib/canvasRenderer'
import { recordDownload } from '../../lib/costTracking'
import LayoutSwitcher from './LayoutSwitcher'

export default function BannerCanvas({ state }) {
  const canvasRef = useRef()
  const wrapperRef = useRef()
  const elementBboxesRef = useRef({})
  const dragRef = useRef(null)
  const [cursor, setCursor] = useState('default')
  const [isDragOver, setIsDragOver] = useState(false)

  const {
    selectedFormat, productImg, logoImg, copy, activePalette, layout, setLayout, productName,
    logoVisible, logoOpacity, logoScale, headlineFont, customTextColor,
    textOffsets, updateTextOffset, resetTextOffsets,
    logoOffset, setLogoOffset,
    imageOffset, setImageOffset,
    imageScale, setImageScale,
    setProductAsset,
    headlineFontSize, subFontSize, ctaColor, badgeColor,
    bannerId,
  } = state

  const MIN_ZOOM = 0.5
  const MAX_ZOOM = 3
  const clampZoom = v => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v))

  const hasContent = !!(copy?.headline || productImg)

  useEffect(() => {
    if (!hasContent) return
    const canvas = canvasRef.current
    if (!canvas) return

    document.fonts.ready.then(() => {
      elementBboxesRef.current = {}
      renderBanner(canvas, {
        format: selectedFormat,
        productImg,
        logoImg,
        copy: copy || { headline: '', sub_headline: '', body_copy: '', cta_text: '', offer_text: '' },
        palette: activePalette,
        layout,
        logoVisible,
        logoOpacity,
        logoScale,
        headlineFont,
        customTextColor,
        textOffsets,
        logoOffset,
        imageOffset,
        imageScale,
        headlineFontSize,
        subFontSize,
        ctaColor,
        badgeColor,
        onElementDrawn: (id, bbox) => {
          elementBboxesRef.current[id] = bbox
        },
      })
    })
  }, [copy, selectedFormat, productImg, logoImg, activePalette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor, textOffsets, logoOffset, imageOffset, imageScale, headlineFontSize, subFontSize, ctaColor, badgeColor])

  const maxDisplayW = 560
  const scale = Math.min(1, maxDisplayW / selectedFormat.width)
  const displayW = Math.round(selectedFormat.width * scale)
  const displayH = Math.round(selectedFormat.height * scale)

  function getCanvasCoords(e) {
    const rect = wrapperRef.current.getBoundingClientRect()
    const scaleX = selectedFormat.width / rect.width
    const scaleY = selectedFormat.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function getHitTarget(cx, cy) {
    // 1. Logo — bbox already includes logoOffset (returned from drawLogo)
    const logoBbox = elementBboxesRef.current['logo']
    if (logoBbox && logoImg && logoVisible) {
      if (cx >= logoBbox.x && cx <= logoBbox.x + logoBbox.w &&
          cy >= logoBbox.y && cy <= logoBbox.y + logoBbox.h) {
        return { type: 'logo' }
      }
    }
    // 2. Text elements (bbox is default position; add current offset for actual position)
    for (const [id, bbox] of Object.entries(elementBboxesRef.current)) {
      if (id === 'logo') continue
      const off = textOffsets?.[id] || { dx: 0, dy: 0 }
      const bx = bbox.x + off.dx
      const by = bbox.y + off.dy
      if (cx >= bx && cx <= bx + bbox.w && cy >= by && cy <= by + bbox.h) {
        return { type: 'text', id }
      }
    }
    // 3. Image — anywhere else
    if (productImg) return { type: 'image' }
    return null
  }

  function handleMouseDown(e) {
    if (!hasContent) return
    const { x, y } = getCanvasCoords(e)
    const hit = getHitTarget(x, y)
    if (!hit) return
    e.preventDefault()
    if (hit.type === 'logo') {
      dragRef.current = { type: 'logo', startX: x, startY: y, origDx: logoOffset.dx || 0, origDy: logoOffset.dy || 0 }
    } else if (hit.type === 'text') {
      const off = textOffsets?.[hit.id] || { dx: 0, dy: 0 }
      dragRef.current = { type: 'text', id: hit.id, startX: x, startY: y, origDx: off.dx, origDy: off.dy }
    } else {
      dragRef.current = { type: 'image', startX: x, startY: y, origDx: imageOffset.dx || 0, origDy: imageOffset.dy || 0 }
    }
    setCursor('grabbing')
  }

  function handleMouseMove(e) {
    if (!hasContent) return
    const { x, y } = getCanvasCoords(e)
    if (dragRef.current) {
      const { type, id, startX, startY, origDx, origDy } = dragRef.current
      const newDx = origDx + (x - startX)
      const newDy = origDy + (y - startY)
      if (type === 'logo') setLogoOffset({ dx: newDx, dy: newDy })
      else if (type === 'text') updateTextOffset(id, newDx, newDy)
      else setImageOffset({ dx: newDx, dy: newDy })
    } else {
      const hit = getHitTarget(x, y)
      if (!hit) setCursor('default')
      else if (hit.type === 'image') setCursor('move')
      else setCursor('grab')
    }
  }

  function handleMouseUp() {
    dragRef.current = null
    setCursor('default')
  }

  // Ctrl/Cmd + wheel over the image zooms; trackpad pinch arrives as ctrlKey wheel too.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    function onWheel(e) {
      if (!productImg) return
      if (!(e.ctrlKey || e.metaKey)) return
      const { x, y } = getCanvasCoords(e)
      const hit = getHitTarget(x, y)
      if (!hit || hit.type !== 'image') return
      e.preventDefault()
      const delta = -e.deltaY
      const factor = Math.exp(delta * 0.0015)
      setImageScale(prev => clampZoom((prev || 1) * factor))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [productImg, imageScale, logoOffset, imageOffset, textOffsets, logoVisible, logoImg])

  function handleFileDrop(file) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => setProductAsset(img, ev.target.result)
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function handleDragOver(e) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function handleDragEnter(e) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setIsDragOver(true)
    }
  }

  function handleDragLeave(e) {
    if (!wrapperRef.current.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileDrop(file)
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const filename = `${productName || 'banner'}-${selectedFormat.id}.png`
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
    // Record the download against the current banner so the history page
    // can show "this banner produced these PNG files".
    if (bannerId) {
      recordDownload({
        bannerId,
        filename,
        formatId: selectedFormat.id,
        productName,
      })
    }
  }

  const hasDragged = Object.keys(textOffsets || {}).length > 0 ||
    (logoOffset.dx !== 0 || logoOffset.dy !== 0) ||
    (imageOffset.dx !== 0 || imageOffset.dy !== 0) ||
    (imageScale && imageScale !== 1)

  function resetAll() {
    resetTextOffsets()
    setLogoOffset({ dx: 0, dy: 0 })
    setImageOffset({ dx: 0, dy: 0 })
    setImageScale(1)
  }

  function zoomIn() { setImageScale(prev => clampZoom((prev || 1) + 0.1)) }
  function zoomOut() { setImageScale(prev => clampZoom((prev || 1) - 0.1)) }
  function zoomReset() { setImageScale(1) }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 self-start">
        <span className="text-sm font-semibold text-gray-200">{selectedFormat.label}</span>
        <span className="text-xs text-gray-500">{selectedFormat.width} × {selectedFormat.height} px</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">{selectedFormat.description}</span>
      </div>

      <div className="self-start">
        <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider font-semibold">Layout</p>
        <LayoutSwitcher layout={layout} onChange={setLayout} />
      </div>

      {productImg && (
        <div className="self-start w-full">
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider font-semibold">Image Zoom</p>
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
            <button
              type="button"
              onClick={zoomOut}
              disabled={(imageScale || 1) <= MIN_ZOOM + 0.001}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 flex items-center justify-center transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={imageScale || 1}
              onChange={e => setImageScale(clampZoom(parseFloat(e.target.value)))}
              className="flex-1 accent-amber-600"
            />
            <button
              type="button"
              onClick={zoomIn}
              disabled={(imageScale || 1) >= MAX_ZOOM - 0.001}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 flex items-center justify-center transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 w-12 text-right tabular-nums">{Math.round((imageScale || 1) * 100)}%</span>
            <button
              type="button"
              onClick={zoomReset}
              disabled={(imageScale || 1) === 1}
              className="text-xs px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 transition-colors"
              title="Reset zoom to 100%"
            >
              Reset
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">Tip: hold Ctrl/Cmd and scroll over the image to zoom</p>
        </div>
      )}

      <div
        ref={wrapperRef}
        className={`relative rounded-xl overflow-hidden shadow-2xl border select-none transition-colors ${isDragOver ? 'border-amber-500' : 'border-gray-800'}`}
        style={{ width: displayW, height: displayH }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-amber-600/20 gap-2 pointer-events-none">
            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-amber-400 font-semibold text-sm">Drop to set as product photo</p>
          </div>
        )}
        {!hasContent && !isDragOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-600 gap-3">
            <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Upload a photo or fill in copy to preview</p>
            <p className="text-xs text-gray-700">or drag an image file directly here</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: displayW, height: displayH, display: hasContent ? 'block' : 'none', cursor }}
        />
      </div>

      {hasContent && (
        <div className="flex items-center gap-3">
          {hasDragged && (
            <button
              onClick={resetAll}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
            >
              Reset positions
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </button>
        </div>
      )}

      {hasContent && (
        <p className="text-xs text-gray-600">Drag image, logo, or any text to reposition</p>
      )}
    </div>
  )
}
