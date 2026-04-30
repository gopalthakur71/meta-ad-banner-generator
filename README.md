# Meta Ad Banner Generator

An AI-powered banner generator for ethnic and saree brands, built with React and Claude AI. Design professional Meta ad creatives and website hero banners directly in the browser — no design tool required.

## What it does

- Enter brand details (name, product description, target audience, tone, CTA)
- Upload a product/model photo
- Pick a color palette (curated ethnic palettes included)
- Choose an ad format
- Claude generates headline, subtext, and CTA copy
- A live canvas renders the final banner

## Ad Formats

| Format | Size | Use |
|---|---|---|
| Feed Square | 1080×1080 | Facebook & Instagram Feed |
| Feed Landscape | 1200×628 | Facebook Feed / Link Ads |
| Stories / Reels | 1080×1920 | Instagram & Facebook Stories |
| Carousel Card | 1080×1080 | Carousel Ad Units |
| Hero — Desktop | 1440×560 | Website Homepage Banner |
| Hero — Mobile | 390×844 | Mobile Homepage Banner |

## Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **Anthropic Claude API** (`@anthropic-ai/sdk`) for copy generation
- HTML5 Canvas for banner rendering

## Project Structure

```
src/
├── components/
│   ├── AssetUploader/     # Photo upload + drop zone
│   ├── BannerCanvas/      # Canvas preview + format switcher
│   ├── BrandForm/         # Brand inputs, format selector, tone picker
│   ├── ColorPicker/       # Color input + ethnic palette presets
│   └── Toolbar/           # Generate / regenerate controls
├── constants/
│   ├── formats.js         # All ad format definitions
│   └── palettes.js        # Ethnic color palettes
├── hooks/
│   ├── useBannerState.js  # Central state for all banner inputs
│   └── useClaudeGenerate.js # Claude API call + loading/error state
├── lib/
│   ├── claudeApi.js       # generateBannerCopy() function
│   └── canvasRenderer/    # Per-format canvas rendering logic
└── App.jsx                # Root layout
```

## Getting Started

```bash
npm install
npm run dev
```

Set your Anthropic API key in the app's API key field before generating.

## Iteration Log

| Version | Date | Summary |
|---|---|---|
| v1.0 | 2026-04-19 | Initial build — all core features |
| — | 2026-04-30 | Reset to v1.0 to restart iteration cleanly |
