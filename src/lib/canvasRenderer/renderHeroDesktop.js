import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect } from './utils'

export function renderHeroDesktop(ctx, { W, H, productImg, logoImg, copy, palette, layout, brandName }) {
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    if (layout === 'left-aligned' || layout === 'minimal') {
      // Image on right half
      drawImageCover(ctx, productImg, W * 0.48, 0, W * 0.52, H)
      const grad = ctx.createLinearGradient(W * 0.42, 0, W * 0.68, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 1))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(W * 0.42, 0, W * 0.26, H)
    } else {
      drawImageCover(ctx, productImg, 0, 0, W, H)
      const grad = ctx.createLinearGradient(0, 0, W * 0.6, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 0.95))
      grad.addColorStop(0.55, hexToRgba(palette.primary, 0.5))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }
  }

  const px = 96
  const textColor = palette.background
  const accentColor = palette.accent
  let y = H * 0.26

  if (copy.offer_text) {
    ctx.font = '500 24px Lato'
    ctx.fillStyle = accentColor
    ctx.letterSpacing = '3px'
    ctx.fillText(copy.offer_text.toUpperCase(), px, y)
    ctx.letterSpacing = '0px'
    y += 42
  }
  ctx.font = 'bold 88px "Playfair Display"'
  ctx.fillStyle = textColor
  y = drawWrappedText(ctx, copy.headline, px, y, W * 0.48, 96)
  ctx.font = '300 32px Lato'
  ctx.fillStyle = hexToRgba('#FFFFFF', 0.84)
  y = drawWrappedText(ctx, copy.sub_headline, px, y + 14, W * 0.44, 42)

  if (copy.body_copy) {
    ctx.font = '400 24px Lato'
    ctx.fillStyle = hexToRgba('#FFFFFF', 0.68)
    y = drawWrappedText(ctx, copy.body_copy, px, y + 10, W * 0.42, 34)
  }
  y += 36
  ctx.fillStyle = accentColor
  drawRoundedRect(ctx, px, y, 240, 64, 32)
  ctx.fill()
  ctx.font = 'bold 26px Lato'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText(copy.cta_text, px + 120, y + 41)
  ctx.textAlign = 'left'

  if (logoImg) {
    const lh = 56, lw = (logoImg.width / logoImg.height) * lh
    ctx.drawImage(logoImg, px, 36, lw, lh)
  } else {
    ctx.font = 'bold 30px "Playfair Display"'
    ctx.fillStyle = accentColor
    ctx.fillText(brandName, px, 74)
  }
}
