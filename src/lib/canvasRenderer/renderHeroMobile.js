import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect, drawLogo, drawOfferBadge } from './utils'

export function renderHeroMobile(ctx, { W, H, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor = '#FFFFFF', textOffsets = {}, onElement, logoOffset = {}, imageOffset = {}, headlineFontSize = 1, subFontSize = 1, ctaColor, badgeColor }) {
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    drawImageCover(ctx, productImg, 0, 0, W, H, imageOffset.dx || 0, imageOffset.dy || 0)
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, hexToRgba(palette.primary, 0.45))
    grad.addColorStop(0.38, 'rgba(0,0,0,0)')
    grad.addColorStop(0.65, hexToRgba(palette.primary, 0.6))
    grad.addColorStop(1, hexToRgba(palette.primary, 0.98))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  if (logoImg && logoVisible) {
    const logoBbox = drawLogo(ctx, logoImg, { W, H, logoOffset, scale: logoScale, opacity: logoOpacity })
    onElement?.('logo', logoBbox)
  }

  const centerX = W / 2
  let y = H * 0.60
  ctx.textAlign = 'center'

  if (copy.offer_text) {
    const off = textOffsets.offer || { dx: 0, dy: 0 }
    onElement?.('offer', { x: centerX - 150, y: y - 30, w: 300, h: 50 })
    drawOfferBadge(ctx, copy.offer_text, centerX + off.dx, y + off.dy, badgeColor || palette.accent, 'center')
    y += 56
    ctx.textAlign = 'center'
  }

  ctx.font = `bold ${Math.round(58 * headlineFontSize)}px "${headlineFont}"`
  ctx.fillStyle = customTextColor
  {
    const off = textOffsets.headline || { dx: 0, dy: 0 }
    onElement?.('headline', { x: 0, y: y - 58, w: W, h: 90 })
    const ny = drawWrappedText(ctx, copy.headline, centerX + off.dx, y + off.dy, W * 0.86, Math.round(66 * headlineFontSize))
    y = ny - off.dy
  }

  ctx.font = `400 ${Math.round(26 * subFontSize)}px Lato`
  ctx.fillStyle = hexToRgba(customTextColor, 0.82)
  {
    const off = textOffsets.sub || { dx: 0, dy: 0 }
    onElement?.('sub', { x: 0, y: y + 10 - 26, w: W, h: 60 })
    const ny = drawWrappedText(ctx, copy.sub_headline, centerX + off.dx, y + 10 + off.dy, W * 0.82, Math.round(34 * subFontSize))
    y = ny - off.dy
  }

  if (copy.body_copy) {
    ctx.font = '400 20px Lato'
    ctx.fillStyle = hexToRgba(customTextColor, 0.65)
    const off = textOffsets.body || { dx: 0, dy: 0 }
    onElement?.('body', { x: 0, y: y + 8 - 20, w: W, h: 50 })
    const ny = drawWrappedText(ctx, copy.body_copy, centerX + off.dx, y + 8 + off.dy, W * 0.8, 28)
    y = ny - off.dy
  }

  y += 28
  {
    const off = textOffsets.cta || { dx: 0, dy: 0 }
    onElement?.('cta', { x: centerX - 140, y: y, w: 280, h: 66 })
    ctx.fillStyle = ctaColor || palette.accent
    drawRoundedRect(ctx, centerX - 140 + off.dx, y + off.dy, 280, 66, 33)
    ctx.fill()
    ctx.font = 'bold 26px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(copy.cta_text, centerX + off.dx, y + 42 + off.dy)
    ctx.textAlign = 'left'
  }
}
