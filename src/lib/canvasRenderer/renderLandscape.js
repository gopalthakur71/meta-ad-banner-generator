import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect } from './utils'

export function renderLandscape(ctx, { W, H, productImg, logoImg, copy, palette, layout, brandName }) {
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    if (layout === 'left-aligned' || layout === 'minimal') {
      drawImageCover(ctx, productImg, W * 0.5, 0, W * 0.5, H)
      ctx.fillStyle = palette.primary
      ctx.fillRect(0, 0, W * 0.52, H)
    } else {
      drawImageCover(ctx, productImg, 0, 0, W, H)
      const grad = ctx.createLinearGradient(0, 0, W * 0.65, 0)
      grad.addColorStop(0, hexToRgba(palette.primary, 0.92))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }
  }

  const textColor = palette.background
  const accentColor = palette.accent
  const px = 72
  let y = H * 0.2

  if (copy.offer_text) {
    ctx.font = '500 22px Lato'
    ctx.fillStyle = accentColor
    ctx.fillText(copy.offer_text.toUpperCase(), px, y)
    y += 36
  }
  ctx.font = 'bold 58px "Playfair Display"'
  ctx.fillStyle = textColor
  y = drawWrappedText(ctx, copy.headline, px, y, W * 0.44, 66)
  ctx.font = '300 26px Lato'
  ctx.fillStyle = hexToRgba('#FFFFFF', 0.85)
  y = drawWrappedText(ctx, copy.sub_headline, px, y + 10, W * 0.44, 34)
  y += 28
  ctx.fillStyle = accentColor
  drawRoundedRect(ctx, px, y, 210, 56, 28)
  ctx.fill()
  ctx.font = 'bold 22px Lato'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText(copy.cta_text, px + 105, y + 36)
  ctx.textAlign = 'left'

  if (logoImg) {
    const lh = 52, lw = (logoImg.width / logoImg.height) * lh
    ctx.drawImage(logoImg, px, 30, lw, lh)
  } else {
    ctx.font = 'bold 24px "Playfair Display"'
    ctx.fillStyle = accentColor
    ctx.fillText(brandName, px, 64)
  }
}
