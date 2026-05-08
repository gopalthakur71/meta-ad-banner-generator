import { useRef, useEffect, useState } from 'react'
import { renderBanner } from '../../lib/canvasRenderer'
import { recordDownload } from '../../lib/costTracking'
import LayoutSwitcher from './LayoutSwitcher'
import TransformHandles from './TransformHandles'

const MIN_RECT = 40   // canvas-pixel minimum width/height during resize
const MIN_SCALE = 0.2 // wheel/slider lower bound, expressed as rect.w / defaultFrame.w
const MAX_SCALE = 5

export default function BannerCanvas({ state }) {
  const canvasRef = useRef()
  const wrapperRef = useRef()
  const elementBboxesRef = useRef({})
  const dragRef = useRef(null)
  const [cursor, setCursor] = useState('default')
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeElement, setActiveElement] = useState(null)
  const [, forceTick] = useState(0)

  const {
    selectedFormat, productImg, logoImg, copy, activePalette, layout, setLayout, productName,
    logoVisible, logoOpacity, logoScale, logoDensity, headlineFont, customTextColor,
    textOffsets, updateTextOffset, resetTextOffsets,
    logoOffset, setLogoOffset,
    imageRect, setImageRect,
    setProductAsset,
    headlineFontSize, subFontSize, ctaColor, badgeColor,
    bannerId,
  } = state

  const hasContent = !!(copy?.headline || productImg)

  // Clear selection whenever the underlying element disappears.
  useEffect(() => {
    if (activeElement === 'image' && !productImg) setActiveElement(null)
  }, [productImg, activeElement])

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
        logoDensity,
        headlineFont,
        customTextColor,
        textOffsets,
        logoOffset,
        imageRect,
        headlineFontSize,
        subFontSize,
        ctaColor,
        badgeColor,
        onElementDrawn: (id, bbox) => {
          elementBboxesRef.current[id] = bbox
        },
      })
      // The handle overlay renders from elementBboxesRef and doesn't re-run
      // on its own. Tick after every render so handle positions stay in sync
      // with the resolved image rect (which may be the default frame when
      // imageRect is null).
      forceTick(n => n + 1)
    })
  }, [copy, selectedFormat, productImg, logoImg, activePalette, layout, logoVisible, logoOpacity, logoScale, logoDensity, headlineFont, customTextColor, textOffsets, logoOffset, imageRect, headlineFontSize, subFontSize, ctaColor, badgeColor])

  const maxDisplayW = 560
  const displayScale = Math.min(1, maxDisplayW / selectedFormat.width)
  const displayW = Math.round(selectedFormat.width * displayScale)
  const displayH = Math.round(selectedFormat.height * displayScale)

  function getCanvasCoords(e) {
    const rect = wrapperRef.current.getBoundingClientRect()
    const sx = selectedFormat.width / rect.width
    const sy = selectedFormat.height / rect.height
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    }
  }

  function pointInRect(cx, cy, r) {
    return r && cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h
  }

  function getHitTarget(cx, cy) {
    const logoBbox = elementBboxesRef.current['logo']
    if (logoBbox && logoImg && logoVisible && pointInRect(cx, cy, logoBbox)) {
      return { type: 'logo' }
    }
    for (const [id, bbox] of Object.entries(elementBboxesRef.current)) {
      if (id === 'logo' || id === 'image' || id === 'image_default') continue
      const off = textOffsets?.[id] || { dx: 0, dy: 0 }
      const moved = { x: bbox.x + off.dx, y: bbox.y + off.dy, w: bbox.w, h: bbox.h }
      if (pointInRect(cx, cy, moved)) return { type: 'text', id }
    }
    const imgRect = elementBboxesRef.current['image']
    if (productImg && pointInRect(cx, cy, imgRect)) return { type: 'image' }
    return null
  }

  function handleMouseDown(e) {
    if (!hasContent) return
    const { x, y } = getCanvasCoords(e)
    const hit = getHitTarget(x, y)
    if (!hit) {
      setActiveElement(null)
      return
    }
    e.preventDefault()
    if (hit.type === 'logo') {
      setActiveElement('logo')
      dragRef.current = { kind: 'translate-logo', startX: x, startY: y, origDx: logoOffset.dx || 0, origDy: logoOffset.dy || 0 }
    } else if (hit.type === 'text') {
      setActiveElement(`text:${hit.id}`)
      const off = textOffsets?.[hit.id] || { dx: 0, dy: 0 }
      dragRef.current = { kind: 'translate-text', id: hit.id, startX: x, startY: y, origDx: off.dx, origDy: off.dy }
    } else {
      setActiveElement('image')
      const r = elementBboxesRef.current['image']
      if (!r) return
      dragRef.current = { kind: 'translate-image', startX: x, startY: y, origRect: { ...r } }
    }
    setCursor('grabbing')
  }

  // Resize starts when a handle is mousedown'd. We capture the original rect
  // and the anchor (the side/corner that must stay put while the cursor moves).
  function handleHandleDown(handleId, e) {
    e.stopPropagation()
    e.preventDefault()
    const { x, y } = getCanvasCoords(e)
    const r = elementBboxesRef.current['image']
    if (!r) return
    setActiveElement('image')
    dragRef.current = {
      kind: 'resize-image',
      handle: handleId,
      startX: x,
      startY: y,
      origRect: { ...r },
    }
    setCursor('grabbing')
  }

  function applyResize(handle, dx, dy, origRect, shiftKey) {
    let { x, y, w, h } = origRect
    if (handle.includes('w')) { x = origRect.x + dx; w = origRect.w - dx }
    if (handle.includes('e')) { w = origRect.w + dx }
    if (handle.includes('n')) { y = origRect.y + dy; h = origRect.h - dy }
    if (handle.includes('s')) { h = origRect.h + dy }

    // Shift on a corner = aspect-locked. Pick the larger relative change so
    // the cursor leads, then reflow the opposite axis from the anchor.
    const isCorner = handle.length === 2
    if (shiftKey && isCorner) {
      const aspect = origRect.w / origRect.h
      const wDelta = Math.abs(w - origRect.w)
      const hDelta = Math.abs(h - origRect.h)
      if (wDelta * (1 / aspect) > hDelta) {
        h = w / aspect
        if (handle.includes('n')) y = origRect.y + origRect.h - h
      } else {
        w = h * aspect
        if (handle.includes('w')) x = origRect.x + origRect.w - w
      }
    }

    // Min-size clamp. Re-anchor the moving edge if we hit the floor.
    if (w < MIN_RECT) {
      if (handle.includes('w')) x = origRect.x + origRect.w - MIN_RECT
      w = MIN_RECT
    }
    if (h < MIN_RECT) {
      if (handle.includes('n')) y = origRect.y + origRect.h - MIN_RECT
      h = MIN_RECT
    }
    return { x, y, w, h }
  }

  function handleMouseMove(e) {
    if (!hasContent) return
    const { x, y } = getCanvasCoords(e)
    const drag = dragRef.current
    if (drag) {
      if (drag.kind === 'translate-logo') {
        setLogoOffset({ dx: drag.origDx + (x - drag.startX), dy: drag.origDy + (y - drag.startY) })
      } else if (drag.kind === 'translate-text') {
        updateTextOffset(drag.id, drag.origDx + (x - drag.startX), drag.origDy + (y - drag.startY))
      } else if (drag.kind === 'translate-image') {
        const dx = x - drag.startX
        const dy = y - drag.startY
        setImageRect({ x: drag.origRect.x + dx, y: drag.origRect.y + dy, w: drag.origRect.w, h: drag.origRect.h })
      } else if (drag.kind === 'resize-image') {
        const dx = x - drag.startX
        const dy = y - drag.startY
        setImageRect(applyResize(drag.handle, dx, dy, drag.origRect, e.shiftKey))
      }
      return
    }
    const hit = getHitTarget(x, y)
    if (!hit) setCursor('default')
    else if (hit.type === 'image') setCursor('move')
    else setCursor('grab')
  }

  function handleMouseUp() {
    dragRef.current = null
    setCursor('default')
  }

  // Ctrl/Cmd + wheel over the image scales the rect about the cursor.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    function onWheel(e) {
      if (!productImg) return
      if (!(e.ctrlKey || e.metaKey)) return
      const { x, y } = getCanvasCoords(e)
      const r = elementBboxesRef.current['image']
      if (!r || !pointInRect(x, y, r)) return
      e.preventDefault()
      const def = elementBboxesRef.current['image_default']
      const factor = Math.exp(-e.deltaY * 0.0015)
      let newW = r.w * factor
      let newH = r.h * factor
      if (def) {
        // Clamp the linear scale relative to the layout default so wheel zoom
        // can't wander forever. Aspect ratio is preserved by the symmetric scale.
        const proposedScale = newW / def.w
        const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, proposedScale))
        const adjust = (clamped * def.w) / newW
        newW *= adjust
        newH *= adjust
      }
      const newX = x - (x - r.x) * (newW / r.w)
      const newY = y - (y - r.y) * (newH / r.h)
      setImageRect({ x: newX, y: newY, w: newW, h: newH })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [productImg, selectedFormat])

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
    if (bannerId) {
      recordDownload({
        bannerId,
        filename,
        formatId: selectedFormat.id,
        productName,
      })
    }
  }

  const hasMoved = Object.keys(textOffsets || {}).length > 0 ||
    (logoOffset.dx !== 0 || logoOffset.dy !== 0) ||
    !!imageRect

  function resetAll() {
    resetTextOffsets()
    setLogoOffset({ dx: 0, dy: 0 })
    setImageRect(null)
  }

  // Slider scale = current rect width / default frame width. Slider change
  // scales the rect symmetrically about its center, preserving whatever
  // aspect the user has.
  const currentRect = elementBboxesRef.current['image']
  const defaultFrame = elementBboxesRef.current['image_default']
  const sliderScale = currentRect && defaultFrame ? currentRect.w / defaultFrame.w : 1

  function setSliderScale(next) {
    if (!currentRect || !defaultFrame) return
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
    const factor = (clamped * defaultFrame.w) / currentRect.w
    const cx = currentRect.x + currentRect.w / 2
    const cy = currentRect.y + currentRect.h / 2
    const w = currentRect.w * factor
    const h = currentRect.h * factor
    setImageRect({ x: cx - w / 2, y: cy - h / 2, w, h })
  }

  function zoomIn()  { setSliderScale(sliderScale + 0.1) }
  function zoomOut() { setSliderScale(sliderScale - 0.1) }
  function zoomReset() { setImageRect(null) }

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
              disabled={sliderScale <= MIN_SCALE + 0.001}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 flex items-center justify-center transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={0.01}
              value={sliderScale}
              onChange={e => setSliderScale(parseFloat(e.target.value))}
              className="flex-1 accent-amber-600"
            />
            <button
              type="button"
              onClick={zoomIn}
              disabled={sliderScale >= MAX_SCALE - 0.001}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 flex items-center justify-center transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 w-12 text-right tabular-nums">{Math.round(sliderScale * 100)}%</span>
            <button
              type="button"
              onClick={zoomReset}
              disabled={!imageRect}
              className="text-xs px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 transition-colors"
              title="Reset image to default frame"
            >
              Reset
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">Click the image to show transform handles. Drag to move, drag a handle to resize, hold Shift on a corner to keep aspect.</p>
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
        {activeElement === 'image' && productImg && (
          <TransformHandles
            rect={elementBboxesRef.current['image']}
            displayScale={displayScale}
            onHandleDown={handleHandleDown}
          />
        )}
      </div>

      {hasContent && (
        <div className="flex items-center gap-3">
          {hasMoved && (
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
        <p className="text-xs text-gray-600">Click an element to select. Drag to move, drag handles to resize.</p>
      )}
    </div>
  )
}
