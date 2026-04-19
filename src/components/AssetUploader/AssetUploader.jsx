import { useState } from 'react'
import DropZone from './DropZone'

export default function AssetUploader({ state }) {
  const { setProductImg, setLogoImg } = state
  const [productPreview, setProductPreview] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Product Photo</p>
        <DropZone
          label="Product / Model Photo"
          preview={productPreview}
          onFile={(img, src) => { setProductImg(img); setProductPreview(src) }}
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Brand Logo</p>
        <DropZone
          label="Brand Logo (PNG preferred)"
          preview={logoPreview}
          onFile={(img, src) => { setLogoImg(img); setLogoPreview(src) }}
        />
      </div>
    </div>
  )
}
