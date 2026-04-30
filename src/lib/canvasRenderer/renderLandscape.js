import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect, drawLogo, drawOfferBadge } from './utils'

export function renderLandscape(ctx, { W, H, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor = '#FFFFFF', textOffsets = {}, onElement, logoOffset = {}, imageOffset = {} }) {
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    if (layout === 'left-aligned' || layout === 'minimal') {
      drawImageCover(ctx, productImg, W * 0.5, 0, W * 0.5, H, imageOffset.dx || 0, imageOffset.dy || 0)
      const grad = ctx.createLinearGradient(0, 0, W * 0.72, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(0.62, hexToRgba(palette.primary, 0.88))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else if (layout === 'right-aligned') {
      drawImageCover(ctx, productImg, 0, 0, W * 0.5, H, imageOffset.dx || 0, imageOffset.dy || 0)
      const grad = ctx.createLinearGradient(W, 0, W * 0.28, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(0.62, hexToRgba(palette.primary, 0.88))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else {
      drawImageCover(ctx, productImg, 0, 0, W, H, imageOffset.dx || 0, imageOffset.dy || 0)
      const grad = ctx.createLinearGradient(0, 0, W * 0.65, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 0.92))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }
  }

  const textColor = customTextColor
  const accentColor = palette.accent
  const isRight = layout === 'right-aligned'
  const px = isRight ? Math.round(W * 0.54) : 72
  const maxW = W * 0.42
  let y = H * 0.2

  ctx.textAlign = 'left'

  if (copy.offer_text) {
    const off = textOffsets.offer || { dx: 0, dy: 0 }
    onElement?.('offer', { x: px - 10, y: y - 30, w: 280, h: 50 })
    drawOfferBadge(ctx, copy.offer_text, px + off.dx, y + off.dy, accentColor, 'left')
    y += 52
  }

  ctx.font = `bold 58px "${headlineFont}"`
  ctx.fillStyle = textColor
  {
    const off = textOffsets.headline || { dx: 0, dy: 0 }
    onElement?.('headline', { x: px - 10, y: y - 58, w: maxW + 10, h: 90 })
    const ny = drawWrappedText(ctx, copy.headline, px + off.dx, y + off.dy, maxW, 66)
    y = ny - off.dy
  }

  ctx.font = '400 26px Lato'
  ctx.fillStyle = hexToRgba(textColor, 0.82)
  {
    const off = textOffsets.sub || { dx: 0, dy: 0 }
    onElement?.('sub', { x: px - 10, y: y + 10 - 26, w: maxW + 10, h: 60 })
    const ny = drawWrappedText(ctx, copy.sub_headline, px + off.dx, y + 10 + off.dy, maxW, 34)
    y = ny - off.dy
  }

  y += 28
  {
    const off = textOffsets.cta || { dx: 0, dy: 0 }
    onElement?.('cta', { x: px, y: y, w: 210, h: 56 })
    ctx.fillStyle = accentColor
    drawRoundedRect(ctx, px + off.dx, y + off.dy, 210, 56, 28)
    ctx.fill()
    ctx.font = 'bold 22px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(copy.cta_text, px + 105 + off.dx, y + 36 + off.dy)
    ctx.textAlign = 'left'
  }

  if (logoImg && logoVisible) {
    const logoBbox = drawLogo(ctx, logoImg, { W, H, logoOffset, scale: logoScale, opacity: logoOpacity })
    onElement?.('logo', logoBbox)
  }
}
