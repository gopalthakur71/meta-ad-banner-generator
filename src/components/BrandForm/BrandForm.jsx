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

export default function BrandForm({ state }) {
  const {
    brandName, setBrandName,
    productDescription, setProductDescription,
    targetAudience, setTargetAudience,
    tone, setTone,
    ctaText, setCtaText,
    selectedFormat, setSelectedFormat,
  } = state

  return (
    <div className="space-y-5">
      <div>
        <Label>Brand Name</Label>
        <Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="e.g. Ijor Sarees" />
      </div>
      <div>
        <Label>Product Description</Label>
        <Textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} placeholder="e.g. Handwoven Banarasi Silk Saree — Bridal Collection" />
      </div>
      <div>
        <Label>Target Audience</Label>
        <Input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g. Women aged 25–45, interested in ethnic fashion" />
      </div>
      <div>
        <Label>CTA Text</Label>
        <Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="e.g. Shop Now" />
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
