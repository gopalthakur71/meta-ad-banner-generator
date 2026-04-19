import { useState } from 'react'
import { generateBannerCopy } from '../lib/claudeApi'

export function useClaudeGenerate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate({ brandName, productDescription, targetAudience, tone, ctaText, formatId, setCopy }) {
    setLoading(true)
    setError(null)
    try {
      const result = await generateBannerCopy({ brandName, productDescription, targetAudience, tone, ctaText, formatId })
      setCopy(result)
    } catch (e) {
      setError(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
