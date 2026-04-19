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

export function renderBanner(canvas, { format, productImg, logoImg, copy, palette, layout, brandName }) {
  const ctx = canvas.getContext('2d')
  canvas.width = format.width
  canvas.height = format.height
  ctx.clearRect(0, 0, format.width, format.height)

  const renderer = renderers[format.id]
  if (!renderer) return

  renderer(ctx, {
    W: format.width,
    H: format.height,
    productImg,
    logoImg,
    copy,
    palette,
    layout,
    brandName,
  })
}
