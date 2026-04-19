import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect } from './utils'

export function renderFeedSquare(ctx, { W, H, productImg, logoImg, copy, palette, layout, brandName }) {
  // Background
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    if (layout === 'overlay' || layout === 'centered') {
      drawImageCover(ctx, productImg, 0, 0, W, H)
      const grad = ctx.createLinearGradient(0, H * 0.45, 0, H)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, hexToRgba(palette.primary, 0.88))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else if (layout === 'left-aligned') {
      drawImageCover(ctx, productImg, W * 0.45, 0, W * 0.55, H)
      ctx.fillStyle = palette.primary
      ctx.fillRect(0, 0, W * 0.48, H)
    } else {
      drawImageCover(ctx, productImg, 0, H * 0.38, W, H * 0.62)
      ctx.fillStyle = palette.primary
      ctx.fillRect(0, 0, W, H * 0.4)
    }
  }

  const textColor = (layout === 'overlay' || layout === 'centered') ? '#FFFFFF' : palette.background
  const accentColor = palette.accent

  if (layout === 'left-aligned') {
    const px = 60
    let y = H * 0.22
    if (copy.offer_text) {
      ctx.font = '500 28px Lato'
      ctx.fillStyle = accentColor
      ctx.fillText(copy.offer_text.toUpperCase(), px, y)
      y += 48
    }
    ctx.font = 'bold 68px "Playfair Display"'
    ctx.fillStyle = textColor
    y = drawWrappedText(ctx, copy.headline, px, y, W * 0.42, 76)
    ctx.font = '300 32px Lato'
    ctx.fillStyle = hexToRgba(textColor === '#FFFFFF' ? '#FFFFFF' : palette.text, 0.85)
    y = drawWrappedText(ctx, copy.sub_headline, px, y + 12, W * 0.42, 42)
    y += 28
    ctx.fillStyle = accentColor
    drawRoundedRect(ctx, px, y, 240, 64, 32)
    ctx.fill()
    ctx.font = 'bold 26px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(copy.cta_text, px + 120, y + 40)
    ctx.textAlign = 'left'
  } else {
    const centerX = W / 2
    let y = layout === 'minimal' ? H * 0.12 : H * 0.58
    ctx.textAlign = 'center'
    if (copy.offer_text) {
      ctx.font = '500 26px Lato'
      ctx.fillStyle = accentColor
      ctx.fillText(copy.offer_text.toUpperCase(), centerX, y)
      y += 44
    }
    ctx.font = 'bold 72px "Playfair Display"'
    ctx.fillStyle = textColor
    y = drawWrappedText(ctx, copy.headline, centerX, y, W * 0.82, 80)
    ctx.font = '300 34px Lato'
    ctx.fillStyle = hexToRgba(textColor === '#FFFFFF' ? '#FFFFFF' : palette.text, 0.85)
    y = drawWrappedText(ctx, copy.sub_headline, centerX, y + 10, W * 0.78, 44)
    y += 32
    ctx.fillStyle = accentColor
    drawRoundedRect(ctx, centerX - 130, y, 260, 68, 34)
    ctx.fill()
    ctx.font = 'bold 28px Lato'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(copy.cta_text, centerX, y + 42)
    ctx.textAlign = 'left'
  }

  // Logo
  if (logoImg) {
    const lh = 64, lw = (logoImg.width / logoImg.height) * lh
    ctx.drawImage(logoImg, W - lw - 40, 36, lw, lh)
  } else {
    ctx.font = 'bold 28px "Playfair Display"'
    ctx.fillStyle = palette.accent
    ctx.textAlign = 'right'
    ctx.fillText(brandName, W - 40, 72)
    ctx.textAlign = 'left'
  }
}
