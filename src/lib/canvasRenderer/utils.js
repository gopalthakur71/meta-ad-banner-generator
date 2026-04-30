export function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
  return currentY + lineHeight
}

export function drawImageCover(ctx, img, x, y, w, h, offsetX = 0, offsetY = 0) {
  const imgAspect = img.width / img.height
  const boxAspect = w / h
  let sx, sy, sw, sh
  if (imgAspect > boxAspect) {
    sh = img.height
    sw = sh * boxAspect
    sx = (img.width - sw) / 2 - offsetX * (sw / w)
    sy = -(offsetY * (sh / h))
  } else {
    sw = img.width
    sh = sw / boxAspect
    sx = -(offsetX * (sw / w))
    sy = (img.height - sh) / 2 - offsetY * (sh / h)
  }
  sx = Math.max(0, Math.min(img.width - sw, sx))
  sy = Math.max(0, Math.min(img.height - sh, sy))
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function drawOfferBadge(ctx, text, x, y, accentColor, align = 'center') {
  const upper = text.toUpperCase()
  ctx.save()
  ctx.font = '600 24px Lato'
  ctx.textAlign = align
  const tw = ctx.measureText(upper).width
  const pw = tw + 36, ph = 36, pr = 18
  const bx = align === 'center' ? x - pw / 2 : x
  ctx.fillStyle = accentColor
  drawRoundedRect(ctx, bx, y - 26, pw, ph, pr)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(upper, x, y)
  ctx.restore()
}

export function drawLogo(ctx, logoImg, { W, H, logoOffset = {}, scale = 1, opacity = 1 }) {
  const baseH = Math.min(Math.max(H * 0.055, 48), 100)
  const lh = baseH * scale
  const lw = (logoImg.width / logoImg.height) * lh
  const pad = Math.round(H * 0.04)
  const defaultX = W - lw - pad
  const defaultY = pad
  const x = defaultX + (logoOffset.dx || 0)
  const y = defaultY + (logoOffset.dy || 0)
  const r = Math.min(lw, lh) / 2
  const cx = x + lw / 2
  const cy = y + lh / 2
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(logoImg, x, y, lw, lh)
  ctx.restore()
  return { x, y, w: lw, h: lh }
}

export function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
