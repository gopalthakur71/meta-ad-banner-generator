import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect, drawLogo, drawOfferBadge } from './utils'

export function renderStories(ctx, { W, H, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor = '#FFFFFF', textOffsets = {}, onElement, logoOffset = {}, imageOffset = {}, imageScale = 1, headlineFontSize = 1, subFontSize = 1, ctaColor, badgeColor }) {
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    drawImageCover(ctx, productImg, 0, 0, W, H, imageOffset.dx || 0, imageOffset.dy || 0, imageScale)
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, hexToRgba(palette.primary, 0.55))
    grad.addColorStop(0.4, 'rgba(0,0,0,0.05)')
    grad.addColorStop(0.72, hexToRgba(palette.primary, 0.7))
    grad.addColorStop(1, hexToRgba(palette.primary, 0.97))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  if (logoImg && logoVisible) {
    const logoBbox = drawLogo(ctx, logoImg, { W, H, logoOffset, scale: logoScale, opacity: logoOpacity })
    onElement?.('logo', logoBbox)
  }

  const centerX = W / 2
  let y = H * 0.66
  ctx.textAlign = 'center'

  if (copy.offer_text) {
    const off = textOffsets.offer || { dx: 0, dy: 0 }
    onElement?.('offer', { x: centerX - 150, y: y - 30, w: 300, h: 50 })
    drawOfferBadge(ctx, copy.offer_text, centerX + off.dx, y + off.dy, badgeColor || palette.accent, 'center')
    y += 56
    ctx.textAlign = 'center'
  }

  ctx.font = `bold ${Math.round(82 * headlineFontSize)}px "${headlineFont}"`
  ctx.fillStyle = customTextColor
  {
    const off = textOffsets.headline || { dx: 0, dy: 0 }
    onElement?.('headline', { x: 0, y: y - 82, w: W, h: 110 })
    const ny = drawWrappedText(ctx, copy.headline, centerX + off.dx, y + off.dy, W * 0.84, Math.round(90 * headlineFontSize))
    y = ny - off.dy
  }

  ctx.font = `400 ${Math.round(36 * subFontSize)}px Lato`
  ctx.fillStyle = hexToRgba(customTextColor, 0.82)
  {
    const off = textOffsets.sub || { dx: 0, dy: 0 }
    onElement?.('sub', { x: 0, y: y + 14 - 36, w: W, h: 70 })
    const ny = drawWrappedText(ctx, copy.sub_headline, centerX + off.dx, y + 14 + off.dy, W * 0.8, Math.round(46 * subFontSize))
    y = ny - off.dy
  }

  y += 36
  {
    const off = textOffsets.cta || { dx: 0, dy: 0 }
    onElement?.('cta', { x: centerX - 180, y: y, w: 360, h: 80 })
    ctx.fillStyle = ctaColor || palette.accent
    drawRoundedRect(ctx, centerX - 180 + off.dx, y + off.dy, 360, 80, 40)
    ctx.fill()
    ctx.font = 'bold 32px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(copy.cta_text, centerX + off.dx, y + 52 + off.dy)
    ctx.textAlign = 'left'
  }
}
