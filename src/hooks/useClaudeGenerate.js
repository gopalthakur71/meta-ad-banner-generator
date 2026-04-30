import { useState } from 'react'
import { generateBannerCopy } from '../lib/claudeApi'

export function useClaudeGenerate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate({ productName, productDescription, tone, formatId, setCopy }) {
    setLoading(true)
    setError(null)
    try {
      const result = await generateBannerCopy({ productName, productDescription, tone, formatId })
      setCopy(result)
    } catch (e) {
      setError(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
