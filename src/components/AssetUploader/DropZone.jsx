import { useRef } from 'react'

export default function DropZone({ label, preview, onFile, onClear, accept = 'image/*' }) {
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) loadFile(file)
  }

  function loadFile(file) {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => onFile(img, ev.target.result)
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => inputRef.current.click()}
      className="relative cursor-pointer border-2 border-dashed border-gray-700 rounded-xl overflow-hidden hover:border-amber-600 transition-colors group"
      style={{ height: 120 }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      {preview ? (
        <>
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to replace
          </span>
          <button
            onClick={e => { e.stopPropagation(); onClear() }}
            className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors z-10"
            title="Remove"
          >
            ×
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-600 group-hover:text-gray-400 transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs text-gray-700">Click or drag & drop</span>
        </div>
      )}
    </div>
  )
}
