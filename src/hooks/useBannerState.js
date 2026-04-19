import { useState } from 'react'
import { AD_FORMATS } from '../constants/formats'
import { ETHNIC_PALETTES } from '../constants/palettes'

export function useBannerState() {
  const [brandName, setBrandName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [tone, setTone] = useState('luxurious')
  const [ctaText, setCtaText] = useState('Shop Now')
  const [selectedFormat, setSelectedFormat] = useState(AD_FORMATS[0])
  const [palette, setPalette] = useState(ETHNIC_PALETTES[0])
  const [customPrimary, setCustomPrimary] = useState(ETHNIC_PALETTES[0].primary)
  const [customAccent, setCustomAccent] = useState(ETHNIC_PALETTES[0].accent)
  const [productImg, setProductImg] = useState(null)
  const [logoImg, setLogoImg] = useState(null)
  const [layout, setLayout] = useState('overlay')
  const [copy, setCopy] = useState(null)

  const activePalette = {
    ...palette,
    primary: customPrimary,
    accent: customAccent,
  }

  return {
    brandName, setBrandName,
    productDescription, setProductDescription,
    targetAudience, setTargetAudience,
    tone, setTone,
    ctaText, setCtaText,
    selectedFormat, setSelectedFormat,
    palette, setPalette,
    customPrimary, setCustomPrimary,
    customAccent, setCustomAccent,
    productImg, setProductImg,
    logoImg, setLogoImg,
    layout, setLayout,
    copy, setCopy,
    activePalette,
  }
}
