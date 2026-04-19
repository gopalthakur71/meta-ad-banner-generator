import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function generateBannerCopy({ brandName, productDescription, targetAudience, tone, ctaText, formatId }) {
  const isWebsiteHero = formatId?.startsWith('hero')
  const context = isWebsiteHero
    ? 'a website homepage hero banner'
    : 'a Meta social media ad banner'

  const prompt = `You are an expert copywriter for premium Indian ethnic wear and saree brands.
Generate compelling ad copy for ${context}.

Brand: ${brandName}
Product: ${productDescription}
Target Audience: ${targetAudience}
Tone/Mood: ${tone}
CTA: ${ctaText}
Format: ${formatId}

${isWebsiteHero
  ? 'This is a website hero banner — copy can be slightly longer and more brand-storytelling focused.'
  : "Follow Meta's best practices: keep text minimal (under 20% of image area), punchy headline, clear CTA."}

Return ONLY valid JSON in this exact shape:
{
  "headline": "Short punchy headline (max 8 words)",
  "sub_headline": "Supporting line that reinforces the value proposition (max 15 words)",
  "body_copy": "Brief body text if needed (max 20 words, or empty string for minimal layouts)",
  "cta_text": "Action-oriented CTA (2-4 words)",
  "offer_text": "Optional offer badge text like 'New Arrival' or 'Free Shipping' (or empty string)",
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
