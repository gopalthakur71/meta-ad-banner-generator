import { useRef, useEffect, useState } from 'react'
import { renderBanner } from '../../lib/canvasRenderer'
import LayoutSwitcher from './LayoutSwitcher'

export default function BannerCanvas({ state }) {
  const canvasRef = useRef()
  const wrapperRef = useRef()
  const elementBboxesRef = useRef({})
  const dragRef = useRef(null)
  const [cursor, setCursor] = useState('default')

  const {
    selectedFormat, productImg, logoImg, copy, activePalette, layout, setLayout, productName,
    logoVisible, logoOpacity, logoScale, headlineFont, customTextColor,
    textOffsets, updateTextOffset, resetTextOffsets,
    logoOffset, setLogoOffset,
    imageOffset, setImageOffset,
  } = state

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
        onElementDrawn: (id, bbox) => {
          elementBboxesRef.current[id] = bbox
        },
      })
    })
  }, [copy, selectedFormat, productImg, logoImg, activePalette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor, textOffsets, logoOffset, imageOffset])

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

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${productName || 'banner'}-${selectedFormat.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const hasDragged = Object.keys(textOffsets || {}).length > 0 ||
    (logoOffset.dx !== 0 || logoOffset.dy !== 0) ||
    (imageOffset.dx !== 0 || imageOffset.dy !== 0)

  function resetAll() {
    resetTextOffsets()
    setLogoOffset({ dx: 0, dy: 0 })
    setImageOffset({ dx: 0, dy: 0 })
  }

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

      <div
        ref={wrapperRef}
        className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 select-none"
        style={{ width: displayW, height: displayH }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {!hasContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-600 gap-3">
            <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Upload a photo or fill in copy to preview</p>
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
