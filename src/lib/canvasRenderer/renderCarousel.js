import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect, drawLogo, drawOfferBadge } from './utils'

export function renderCarousel(ctx, { W, H, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor = '#FFFFFF', textOffsets = {}, onElement, logoOffset = {}, imageOffset = {}, headlineFontSize = 1, subFontSize = 1, ctaColor, badgeColor }) {
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, W, H)

  const imgH = Math.floor(H * 0.62)
  if (productImg) drawImageCover(ctx, productImg, 0, 0, W, imgH, imageOffset.dx || 0, imageOffset.dy || 0)

  ctx.fillStyle = palette.primary
  ctx.fillRect(0, imgH - 4, W, H - imgH + 4)

  ctx.fillStyle = palette.accent
  ctx.fillRect(0, imgH - 4, W, 6)

  const px = 52
  let y = imgH + 48
  ctx.textAlign = 'left'

  if (copy.offer_text) {
    const off = textOffsets.offer || { dx: 0, dy: 0 }
    onElement?.('offer', { x: px - 10, y: y - 30, w: 280, h: 50 })
    drawOfferBadge(ctx, copy.offer_text, px + off.dx, y + off.dy, badgeColor || palette.accent, 'left')
    y += 52
  }

  ctx.font = `bold ${Math.round(56 * headlineFontSize)}px "${headlineFont}"`
  ctx.fillStyle = customTextColor
  {
    const off = textOffsets.headline || { dx: 0, dy: 0 }
    onElement?.('headline', { x: px - 10, y: y - 56, w: W - px * 2, h: 90 })
    const ny = drawWrappedText(ctx, copy.headline, px + off.dx, y + off.dy, W - px * 2, Math.round(64 * headlineFontSize))
    y = ny - off.dy
  }

  ctx.font = `400 ${Math.round(28 * subFontSize)}px Lato`
  ctx.fillStyle = hexToRgba(customTextColor, 0.78)
  {
    const off = textOffsets.sub || { dx: 0, dy: 0 }
    onElement?.('sub', { x: px - 10, y: y + 8 - 28, w: W - px * 2, h: 60 })
    const ny = drawWrappedText(ctx, copy.sub_headline, px + off.dx, y + 8 + off.dy, W - px * 2, Math.round(36 * subFontSize))
    y = ny - off.dy
  }

  y += 28
  {
    const off = textOffsets.cta || { dx: 0, dy: 0 }
    onElement?.('cta', { x: px, y: y, w: 220, h: 60 })
    ctx.fillStyle = ctaColor || palette.accent
    drawRoundedRect(ctx, px + off.dx, y + off.dy, 220, 60, 30)
    ctx.fill()
    ctx.font = 'bold 24px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(copy.cta_text, px + 110 + off.dx, y + 38 + off.dy)
    ctx.textAlign = 'left'
  }

  if (logoImg && logoVisible) {
    const logoBbox = drawLogo(ctx, logoImg, { W, H, logoOffset, scale: logoScale, opacity: logoOpacity })
    onElement?.('logo', logoBbox)
  }
}
