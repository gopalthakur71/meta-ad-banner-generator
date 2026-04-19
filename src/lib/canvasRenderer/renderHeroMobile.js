import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect } from './utils'

export function renderHeroMobile(ctx, { W, H, productImg, logoImg, copy, palette, layout, brandName }) {
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, 0, W, H)

  if (productImg) {
    drawImageCover(ctx, productImg, 0, 0, W, H)
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, hexToRgba(palette.primary, 0.45))
    grad.addColorStop(0.38, 'rgba(0,0,0,0)')
    grad.addColorStop(0.65, hexToRgba(palette.primary, 0.6))
    grad.addColorStop(1, hexToRgba(palette.primary, 0.98))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  // Logo at top center
  if (logoImg) {
    const lh = 60, lw = (logoImg.width / logoImg.height) * lh
    ctx.drawImage(logoImg, (W - lw) / 2, 56, lw, lh)
  } else {
    ctx.font = 'bold 30px "Playfair Display"'
    ctx.fillStyle = palette.accent
    ctx.textAlign = 'center'
    ctx.fillText(brandName, W / 2, 102)
  }

  const centerX = W / 2
  let y = H * 0.60
  ctx.textAlign = 'center'

  if (copy.offer_text) {
    ctx.font = '500 22px Lato'
    ctx.fillStyle = palette.accent
    ctx.fillText(copy.offer_text.toUpperCase(), centerX, y)
    y += 38
  }
  ctx.font = 'bold 58px "Playfair Display"'
  ctx.fillStyle = '#FFFFFF'
  y = drawWrappedText(ctx, copy.headline, centerX, y, W * 0.86, 66)
  ctx.font = '300 26px Lato'
  ctx.fillStyle = hexToRgba('#FFFFFF', 0.82)
  y = drawWrappedText(ctx, copy.sub_headline, centerX, y + 10, W * 0.82, 34)

  if (copy.body_copy) {
    ctx.font = '400 20px Lato'
    ctx.fillStyle = hexToRgba('#FFFFFF', 0.65)
    y = drawWrappedText(ctx, copy.body_copy, centerX, y + 8, W * 0.8, 28)
  }
  y += 28

  ctx.fillStyle = palette.accent
  drawRoundedRect(ctx, centerX - 140, y, 280, 66, 33)
  ctx.fill()
  ctx.font = 'bold 26px Lato'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(copy.cta_text, centerX, y + 42)
  ctx.textAlign = 'left'
}
