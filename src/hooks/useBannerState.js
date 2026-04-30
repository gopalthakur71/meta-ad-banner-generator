import { useState, useEffect } from 'react'
import { AD_FORMATS } from '../constants/formats'
import { ETHNIC_PALETTES } from '../constants/palettes'

function srcToImg(src, callback) {
  const img = new Image()
  img.onload = () => callback(img)
  img.src = src
}

export function useBannerState() {
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [tone, setTone] = useState('luxurious')
  const [headlineFont, setHeadlineFont] = useState('Playfair Display')
  const [selectedFormat, setSelectedFormat] = useState(AD_FORMATS[0])
  const [palette, setPalette] = useState(ETHNIC_PALETTES[0])
  const [customPrimary, setCustomPrimary] = useState(ETHNIC_PALETTES[0].primary)
  const [customAccent, setCustomAccent] = useState(ETHNIC_PALETTES[0].accent)
  const [customTextColor, setCustomTextColor] = useState('#FFFFFF')
  const [productImg, setProductImg] = useState(null)
  const [productSrc, setProductSrc] = useState(() => localStorage.getItem('banner_productSrc'))
  const [logoImg, setLogoImg] = useState(null)
  const [logoSrc, setLogoSrc] = useState(() => localStorage.getItem('banner_logoSrc'))
  const [layout, setLayout] = useState('overlay')
  const [copy, setCopy] = useState(null)

  const [logoVisible, setLogoVisible] = useState(true)
  const [logoOpacity, setLogoOpacity] = useState(1)
  const [logoScale, setLogoScale] = useState(1)
  const [logoOffset, setLogoOffset] = useState({ dx: 0, dy: 0 })
  const [imageOffset, setImageOffset] = useState({ dx: 0, dy: 0 })
  const [textOffsets, setTextOffsets] = useState({})

  useEffect(() => {
    const src = localStorage.getItem('banner_productSrc')
    if (src) srcToImg(src, setProductImg)
  }, [])

  useEffect(() => {
    const src = localStorage.getItem('banner_logoSrc')
    if (src) srcToImg(src, setLogoImg)
  }, [])

  function setProductAsset(img, src) {
    setProductImg(img)
    setProductSrc(src)
    setImageOffset({ dx: 0, dy: 0 })
    localStorage.setItem('banner_productSrc', src)
  }

  function clearProductAsset() {
    setProductImg(null)
    setProductSrc(null)
    setImageOffset({ dx: 0, dy: 0 })
    localStorage.removeItem('banner_productSrc')
  }

  function setLogoAsset(img, src) {
    setLogoImg(img)
    setLogoSrc(src)
    setLogoOffset({ dx: 0, dy: 0 })
    localStorage.setItem('banner_logoSrc', src)
  }

  function clearLogoAsset() {
    setLogoImg(null)
    setLogoSrc(null)
    setLogoOffset({ dx: 0, dy: 0 })
    localStorage.removeItem('banner_logoSrc')
  }

  function updateTextOffset(id, dx, dy) {
    setTextOffsets(prev => ({ ...prev, [id]: { dx, dy } }))
  }

  function resetTextOffsets() {
    setTextOffsets({})
  }

  function changePhoto() {
    clearProductAsset()
  }

  function newProduct() {
    clearProductAsset()
    setCopy(null)
    setProductName('')
    setProductDescription('')
    setTextOffsets({})
    setLogoOffset({ dx: 0, dy: 0 })
  }

  const activePalette = {
    ...palette,
    primary: customPrimary,
    accent: customAccent,
  }

  return {
    productName, setProductName,
    productDescription, setProductDescription,
    tone, setTone,
    headlineFont, setHeadlineFont,
    textOffsets, updateTextOffset, resetTextOffsets,
    imageOffset, setImageOffset,
    logoOffset, setLogoOffset,
    selectedFormat, setSelectedFormat,
    palette, setPalette,
    customPrimary, setCustomPrimary,
    customAccent, setCustomAccent,
    customTextColor, setCustomTextColor,
    productImg, productSrc, setProductAsset, clearProductAsset,
    logoImg, logoSrc, setLogoAsset, clearLogoAsset,
    changePhoto, newProduct,
    logoVisible, setLogoVisible,
    logoOpacity, setLogoOpacity,
    logoScale, setLogoScale,
    layout, setLayout,
    copy, setCopy,
    activePalette,
  }
}
