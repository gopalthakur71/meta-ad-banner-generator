import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect, drawLogo, drawOfferBadge } from './utils'

export function renderFeedSquare(ctx, { W, H, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor = '#FFFFFF', textOffsets = {}, onElement, logoOffset = {}, imageOffset = {}, imageScale = 1, headlineFontSize = 1, subFontSize = 1, ctaColor, badgeColor }) {
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    if (layout === 'overlay' || layout === 'centered') {
      drawImageCover(ctx, productImg, 0, 0, W, H, imageOffset.dx || 0, imageOffset.dy || 0, imageScale)
      const grad = ctx.createLinearGradient(0, H * 0.45, 0, H)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, hexToRgba(palette.primary, 0.88))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else if (layout === 'left-aligned') {
      drawImageCover(ctx, productImg, W * 0.45, 0, W * 0.55, H, imageOffset.dx || 0, imageOffset.dy || 0, imageScale)
      const grad = ctx.createLinearGradient(0, 0, W * 0.72, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(0.6, hexToRgba(palette.primary, 0.9))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else if (layout === 'right-aligned') {
      drawImageCover(ctx, productImg, 0, 0, W * 0.55, H, imageOffset.dx || 0, imageOffset.dy || 0, imageScale)
      const grad = ctx.createLinearGradient(W, 0, W * 0.28, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(0.6, hexToRgba(palette.primary, 0.9))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else {
      drawImageCover(ctx, productImg, 0, H * 0.38, W, H * 0.62, imageOffset.dx || 0, imageOffset.dy || 0, imageScale)
      ctx.fillStyle = palette.primary
      ctx.fillRect(0, 0, W, H * 0.4)
    }
  }

  const isRight = layout === 'right-aligned'
  const isLeft = layout === 'left-aligned' || isRight
  const textColor = customTextColor
  const accentColor = palette.accent
  const btnColor = ctaColor || accentColor
  const bdgColor = badgeColor || accentColor

  if (isLeft) {
    const px = isRight ? Math.round(W * 0.54) : 60
    const maxW = W * 0.42
    let y = H * 0.22

    if (copy.offer_text) {
      const off = textOffsets.offer || { dx: 0, dy: 0 }
      onElement?.('offer', { x: px - 10, y: y - 30, w: 280, h: 50 })
      drawOfferBadge(ctx, copy.offer_text, px + off.dx, y + off.dy, bdgColor, 'left')
      y += 52
    }

    ctx.textAlign = 'left'
    ctx.font = `bold ${Math.round(68 * headlineFontSize)}px "${headlineFont}"`
    ctx.fillStyle = textColor
    {
      const off = textOffsets.headline || { dx: 0, dy: 0 }
      onElement?.('headline', { x: px - 10, y: y - 68, w: maxW + 10, h: 100 })
      const ny = drawWrappedText(ctx, copy.headline, px + off.dx, y + off.dy, maxW, Math.round(76 * headlineFontSize))
      y = ny - off.dy
    }

    ctx.font = `400 ${Math.round(32 * subFontSize)}px Lato`
    ctx.fillStyle = hexToRgba(textColor, 0.82)
    {
      const off = textOffsets.sub || { dx: 0, dy: 0 }
      onElement?.('sub', { x: px - 10, y: y + 12 - 32, w: maxW + 10, h: 70 })
      const ny = drawWrappedText(ctx, copy.sub_headline, px + off.dx, y + 12 + off.dy, maxW, Math.round(42 * subFontSize))
      y = ny - off.dy
    }

    y += 28
    {
      const off = textOffsets.cta || { dx: 0, dy: 0 }
      onElement?.('cta', { x: px, y: y, w: 240, h: 64 })
      ctx.fillStyle = btnColor
      drawRoundedRect(ctx, px + off.dx, y + off.dy, 240, 64, 32)
      ctx.fill()
      ctx.font = 'bold 26px Lato'
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.fillText(copy.cta_text, px + 120 + off.dx, y + 40 + off.dy)
      ctx.textAlign = 'left'
    }
  } else {
    const centerX = W / 2
    let y = layout === 'minimal' ? H * 0.12 : H * 0.58
    ctx.textAlign = 'center'

    if (copy.offer_text) {
      const off = textOffsets.offer || { dx: 0, dy: 0 }
      onElement?.('offer', { x: centerX - 150, y: y - 30, w: 300, h: 50 })
      drawOfferBadge(ctx, copy.offer_text, centerX + off.dx, y + off.dy, bdgColor, 'center')
      y += 52
      ctx.textAlign = 'center'
    }

    ctx.font = `bold ${Math.round(72 * headlineFontSize)}px "${headlineFont}"`
    ctx.fillStyle = textColor
    {
      const off = textOffsets.headline || { dx: 0, dy: 0 }
      onElement?.('headline', { x: 0, y: y - 72, w: W, h: 100 })
      const ny = drawWrappedText(ctx, copy.headline, centerX + off.dx, y + off.dy, W * 0.82, Math.round(80 * headlineFontSize))
      y = ny - off.dy
    }

    ctx.font = `400 ${Math.round(34 * subFontSize)}px Lato`
    ctx.fillStyle = hexToRgba(textColor, 0.82)
    {
      const off = textOffsets.sub || { dx: 0, dy: 0 }
      onElement?.('sub', { x: 0, y: y + 10 - 34, w: W, h: 70 })
      const ny = drawWrappedText(ctx, copy.sub_headline, centerX + off.dx, y + 10 + off.dy, W * 0.78, Math.round(44 * subFontSize))
      y = ny - off.dy
    }

    y += 32
    {
      const off = textOffsets.cta || { dx: 0, dy: 0 }
      onElement?.('cta', { x: centerX - 130, y: y, w: 260, h: 68 })
      ctx.fillStyle = btnColor
      drawRoundedRect(ctx, centerX - 130 + off.dx, y + off.dy, 260, 68, 34)
      ctx.fill()
      ctx.font = 'bold 28px Lato'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(copy.cta_text, centerX + off.dx, y + off.dy + 42)
      ctx.textAlign = 'left'
    }
  }

  if (logoImg && logoVisible) {
    const logoBbox = drawLogo(ctx, logoImg, { W, H, logoOffset, scale: logoScale, opacity: logoOpacity })
    onElement?.('logo', logoBbox)
  }
}
