import { drawImageInRect, drawWrappedText, hexToRgba, drawRoundedRect, drawLogo, drawOfferBadge } from './utils'

export function renderHeroDesktop(ctx, { W, H, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, logoDensity, headlineFont, customTextColor = '#FFFFFF', textOffsets = {}, onElement, logoOffset = {}, imageRect = null, headlineFontSize = 1, subFontSize = 1, ctaColor, badgeColor }) {
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    let frame
    if (layout === 'left-aligned' || layout === 'minimal') {
      frame = { x: W * 0.48, y: 0, w: W * 0.52, h: H }
    } else if (layout === 'right-aligned') {
      frame = { x: 0, y: 0, w: W * 0.52, h: H }
    } else {
      frame = { x: 0, y: 0, w: W, h: H }
    }
    const rect = imageRect ?? frame
    drawImageInRect(ctx, productImg, rect.x, rect.y, rect.w, rect.h)
    onElement?.('image', rect)
    onElement?.('image_default', frame)

    if (layout === 'left-aligned' || layout === 'minimal') {
      const grad = ctx.createLinearGradient(W * 0.42, 0, W * 0.68, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(W * 0.42, 0, W * 0.26, H)
    } else if (layout === 'right-aligned') {
      const grad = ctx.createLinearGradient(W * 0.58, 0, W * 0.32, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(W * 0.32, 0, W * 0.26, H)
      ctx.fillStyle = hexToRgba(palette.primary, 1)
      ctx.fillRect(W * 0.58, 0, W * 0.42, H)
    } else {
      const grad = ctx.createLinearGradient(0, 0, W * 0.6, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 0.95))
      grad.addColorStop(0.55, hexToRgba(palette.primary, 0.5))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }
  }

  const isRight = layout === 'right-aligned'
  const px = isRight ? Math.round(W * 0.6) : 96
  const maxW = W * 0.36
  const textColor = customTextColor
  const accentColor = palette.accent
  const btnColor = ctaColor || accentColor
  const bdgColor = badgeColor || accentColor
  let y = H * 0.26

  ctx.textAlign = 'left'

  if (copy.offer_text) {
    const off = textOffsets.offer || { dx: 0, dy: 0 }
    onElement?.('offer', { x: px - 10, y: y - 30, w: 300, h: 56 })
    drawOfferBadge(ctx, copy.offer_text, px + off.dx, y + off.dy, bdgColor, 'left')
    y += 56
  }

  ctx.font = `bold ${Math.round(88 * headlineFontSize)}px "${headlineFont}"`
  ctx.fillStyle = textColor
  {
    const off = textOffsets.headline || { dx: 0, dy: 0 }
    onElement?.('headline', { x: px - 10, y: y - 88, w: maxW + 10, h: 120 })
    const ny = drawWrappedText(ctx, copy.headline, px + off.dx, y + off.dy, maxW, Math.round(96 * headlineFontSize))
    y = ny - off.dy
  }

  ctx.font = `400 ${Math.round(32 * subFontSize)}px Lato`
  ctx.fillStyle = hexToRgba(textColor, 0.82)
  {
    const off = textOffsets.sub || { dx: 0, dy: 0 }
    onElement?.('sub', { x: px - 10, y: y + 14 - 32, w: maxW + 10, h: 70 })
    const ny = drawWrappedText(ctx, copy.sub_headline, px + off.dx, y + 14 + off.dy, maxW, Math.round(42 * subFontSize))
    y = ny - off.dy
  }

  if (copy.body_copy) {
    ctx.font = '400 24px Lato'
    ctx.fillStyle = hexToRgba(textColor, 0.65)
    const off = textOffsets.body || { dx: 0, dy: 0 }
    onElement?.('body', { x: px - 10, y: y + 10 - 24, w: maxW + 10, h: 60 })
    const ny = drawWrappedText(ctx, copy.body_copy, px + off.dx, y + 10 + off.dy, maxW, 34)
    y = ny - off.dy
  }

  y += 36
  {
    const off = textOffsets.cta || { dx: 0, dy: 0 }
    onElement?.('cta', { x: px, y: y, w: 240, h: 64 })
    ctx.fillStyle = btnColor
    drawRoundedRect(ctx, px + off.dx, y + off.dy, 240, 64, 32)
    ctx.fill()
    ctx.font = 'bold 26px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(copy.cta_text, px + 120 + off.dx, y + 41 + off.dy)
    ctx.textAlign = 'left'
  }

  if (logoImg && logoVisible) {
    const logoBbox = drawLogo(ctx, logoImg, { W, H, logoOffset, scale: logoScale, opacity: logoOpacity, density: logoDensity })
    onElement?.('logo', logoBbox)
  }
}
