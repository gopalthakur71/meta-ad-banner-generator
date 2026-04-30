const EMPTY_COPY = { headline: '', sub_headline: '', body_copy: '', cta_text: 'Shop Now', offer_text: '', layout_suggestion: 'overlay' }

function Label({ children }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{children}</label>
}

function Input({ ...props }) {
  return (
    <input
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors"
      {...props}
    />
  )
}

function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors resize-none"
      rows={2}
      {...props}
    />
  )
}

export default function CopyEditor({ copy, setCopy }) {
  const c = copy || EMPTY_COPY

  function update(key, value) {
    setCopy({ ...(copy || EMPTY_COPY), [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Offer Badge</Label>
        <Input
          value={c.offer_text}
          onChange={e => update('offer_text', e.target.value)}
          placeholder="e.g. 20% Off · Free Shipping · New Arrival"
        />
      </div>
      <div>
        <Label>Headline</Label>
        <Textarea
          value={c.headline}
          onChange={e => update('headline', e.target.value)}
          placeholder="Main headline (max 8 words)"
        />
      </div>
      <div>
        <Label>Sub Headline</Label>
        <Textarea
          value={c.sub_headline}
          onChange={e => update('sub_headline', e.target.value)}
          placeholder="Supporting line"
        />
      </div>
      <div>
        <Label>CTA Button</Label>
        <Input
          value={c.cta_text}
          onChange={e => update('cta_text', e.target.value)}
          placeholder="Shop Now"
        />
      </div>
      {copy && (
        <button
          onClick={() => setCopy(null)}
          className="w-full text-xs text-gray-600 hover:text-red-400 transition-colors py-1"
        >
          Clear copy
        </button>
      )}
    </div>
  )
}
