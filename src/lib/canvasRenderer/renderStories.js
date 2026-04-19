import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect } from './utils'

export function renderStories(ctx, { W, H, productImg, logoImg, copy, palette, layout, brandName }) {
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    drawImageCover(ctx, productImg, 0, 0, W, H)
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, hexToRgba(palette.primary, 0.55))
    grad.addColorStop(0.4, 'rgba(0,0,0,0.05)')
    grad.addColorStop(0.72, hexToRgba(palette.primary, 0.7))
    grad.addColorStop(1, hexToRgba(palette.primary, 0.97))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  // Top logo area
  if (logoImg) {
    const lh = 72, lw = (logoImg.width / logoImg.height) * lh
    ctx.drawImage(logoImg, (W - lw) / 2, 80, lw, lh)
  } else {
    ctx.font = 'bold 36px "Playfair Display"'
    ctx.fillStyle = palette.accent
    ctx.textAlign = 'center'
    ctx.fillText(brandName, W / 2, 130)
    ctx.textAlign = 'left'
  }

  // Bottom copy
  const centerX = W / 2
  let y = H * 0.66
  ctx.textAlign = 'center'

  if (copy.offer_text) {
    ctx.fillStyle = palette.accent
    ctx.font = '500 30px Lato'
    ctx.fillText(copy.offer_text.toUpperCase(), centerX, y)
    y += 50
  }
  ctx.font = 'bold 82px "Playfair Display"'
  ctx.fillStyle = '#FFFFFF'
  y = drawWrappedText(ctx, copy.headline, centerX, y, W * 0.84, 90)
  ctx.font = '300 36px Lato'
  ctx.fillStyle = hexToRgba('#FFFFFF', 0.82)
  y = drawWrappedText(ctx, copy.sub_headline, centerX, y + 14, W * 0.8, 46)
  y += 36

  ctx.fillStyle = palette.accent
  drawRoundedRect(ctx, centerX - 180, y, 360, 80, 40)
  ctx.fill()
  ctx.font = 'bold 32px Lato'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(copy.cta_text, centerX, y + 52)
  ctx.textAlign = 'left'
}
