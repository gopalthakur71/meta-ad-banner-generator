import { drawImageCover, drawWrappedText, hexToRgba, drawRoundedRect } from './utils'

// Carousel uses same canvas dimensions as feed square but with a distinct split-card aesthetic
export function renderCarousel(ctx, { W, H, productImg, logoImg, copy, palette, layout, brandName }) {
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, W, H)

  const imgH = Math.floor(H * 0.62)
  if (productImg) drawImageCover(ctx, productImg, 0, 0, W, imgH)

  // Bottom content card
  ctx.fillStyle = palette.primary
  ctx.fillRect(0, imgH - 4, W, H - imgH + 4)

  // Accent top border line
  ctx.fillStyle = palette.accent
  ctx.fillRect(0, imgH - 4, W, 6)

  const px = 52
  let y = imgH + 48
  ctx.textAlign = 'left'

  if (copy.offer_text) {
    ctx.font = '500 24px Lato'
    ctx.fillStyle = palette.accent
    ctx.fillText(copy.offer_text.toUpperCase(), px, y)
    y += 40
  }
  ctx.font = 'bold 56px "Playfair Display"'
  ctx.fillStyle = palette.background
  y = drawWrappedText(ctx, copy.headline, px, y, W - px * 2, 64)
  ctx.font = '300 28px Lato'
  ctx.fillStyle = hexToRgba(palette.background, 0.78)
  y = drawWrappedText(ctx, copy.sub_headline, px, y + 8, W - px * 2, 36)
  y += 28

  ctx.fillStyle = palette.accent
  drawRoundedRect(ctx, px, y, 220, 60, 30)
  ctx.fill()
  ctx.font = 'bold 24px Lato'
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText(copy.cta_text, px + 110, y + 38)
  ctx.textAlign = 'left'

  if (logoImg) {
    const lh = 52, lw = (logoImg.width / logoImg.height) * lh
    ctx.drawImage(logoImg, W - lw - 40, 28, lw, lh)
  } else {
    ctx.font = 'bold 24px "Playfair Display"'
    ctx.fillStyle = palette.accent
    ctx.textAlign = 'right'
    ctx.fillText(brandName, W - 40, 64)
    ctx.textAlign = 'left'
  }
}
