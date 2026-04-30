import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function generateBannerCopy({ productName, productDescription, tone, formatId }) {
  const isWebsiteHero = formatId?.startsWith('hero')
  const context = isWebsiteHero
    ? 'a website homepage hero banner'
    : 'a Meta social media ad banner'

  const prompt = `You are a master copywriter for premium Indian ethnic wear and saree brands — think Sabyasachi, Raw Mango, and Ekaya Banaras. Your writing is poetic, evocative, and luxurious.

Create captivating ad copy for ${context}.

Product: ${productName}
Description: ${productDescription}
Tone: ${tone}
Format: ${formatId}

${isWebsiteHero
  ? 'This is a website hero — write brand-storytelling copy that draws the viewer in.'
  : 'This is a social media ad — keep it punchy and emotionally resonant. Every word must earn its place.'}

Guidelines:
- Headline: Short, poetic, and memorable. Use metaphor or sensory language. Max 7 words.
- Sub-headline: Reinforces the headline with a specific benefit or mood. Max 14 words.
- CTA: Action-oriented and inviting (2–4 words).
- Offer badge: A short label like "New Arrival", "Limited Edition", "Festive Edit", or leave empty.
- Avoid clichés like "Timeless elegance" or "Crafted with love" — be specific and fresh.

Return ONLY valid JSON in this exact shape:
{
  "headline": "Short poetic headline",
  "sub_headline": "Supporting line with specific appeal",
  "body_copy": "Brief body text if needed (max 20 words, or empty string)",
  "cta_text": "Shop Now",
  "offer_text": "New Arrival",
  "layout_suggestion": "one of: centered | left-aligned | overlay | minimal"
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text.trim()
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid JSON response from Claude')
  return JSON.parse(jsonMatch[0])
}
