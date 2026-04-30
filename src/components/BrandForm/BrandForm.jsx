import FormatSelector from './FormatSelector'
import TonePicker from './TonePicker'

function Label({ children }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{children}</label>
}

function Input({ ...props }) {
  return (
    <input
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors"
      {...props}
    />
  )
}

function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors resize-none"
      rows={2}
      {...props}
    />
  )
}

export default function BrandForm({ state, onGenerate, loading, canGenerate }) {
  const {
    productName, setProductName,
    productDescription, setProductDescription,
    tone, setTone,
    selectedFormat, setSelectedFormat,
  } = state

  return (
    <div className="space-y-5">
      <div>
        <Label>Product Name</Label>
        <Input
          value={productName}
          onChange={e => setProductName(e.target.value)}
          placeholder="e.g. Ijor Banarasi Silk Sarees"
        />
      </div>
      <div>
        <Label>Product Description</Label>
        <Textarea
          value={productDescription}
          onChange={e => setProductDescription(e.target.value)}
          placeholder="e.g. Handwoven Banarasi Silk Saree — Bridal Collection"
        />
        <button
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Caption
            </>
          )}
        </button>
      </div>
      <div>
        <Label>Tone / Mood</Label>
        <TonePicker tone={tone} onChange={setTone} />
      </div>
      <div>
        <Label>Ad Format</Label>
        <FormatSelector selectedFormat={selectedFormat} onSelect={setSelectedFormat} />
      </div>
    </div>
  )
}
