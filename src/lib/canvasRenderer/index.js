import { renderFeedSquare } from './renderFeedSquare'
import { renderLandscape } from './renderLandscape'
import { renderStories } from './renderStories'
import { renderCarousel } from './renderCarousel'
import { renderHeroDesktop } from './renderHeroDesktop'
import { renderHeroMobile } from './renderHeroMobile'

const renderers = {
  'feed-square': renderFeedSquare,
  'carousel': renderCarousel,
  'feed-landscape': renderLandscape,
  'stories': renderStories,
  'hero-desktop': renderHeroDesktop,
  'hero-mobile': renderHeroMobile,
}

export function renderBanner(canvas, { format, productImg, logoImg, copy, palette, layout, logoVisible, logoOpacity, logoScale, headlineFont, customTextColor, textOffsets, onElementDrawn, logoOffset, imageOffset, headlineFontSize, subFontSize, ctaColor, badgeColor }) {
  const ctx = canvas.getContext('2d')
  canvas.width = format.width
  canvas.height = format.height
  const W = format.width
  const H = format.height

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.textAlign = 'left'
  ctx.clearRect(0, 0, W, H)

  const renderer = renderers[format.id]
  if (!renderer) return

  renderer(ctx, {
    W,
    H,
    productImg,
    logoImg,
    copy,
    palette,
    layout,
    logoVisible,
    logoOpacity,
    logoScale,
    headlineFont: headlineFont || 'Playfair Display',
    customTextColor: customTextColor || '#FFFFFF',
    textOffsets: textOffsets || {},
    onElement: onElementDrawn,
    logoOffset: logoOffset || {},
    imageOffset: imageOffset || {},
    headlineFontSize: headlineFontSize || 1,
    subFontSize: subFontSize || 1,
    ctaColor: ctaColor,
    badgeColor: badgeColor,
  })
}
