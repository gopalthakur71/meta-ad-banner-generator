import { useState } from 'react'
import { generateBannerCopy } from '../lib/claudeApi'
import { recordGeneration } from '../lib/costTracking'

export function useClaudeGenerate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // Bumped each time a generation is recorded. UI components that read
  // localStorage (CostChip, history modal) can subscribe to this counter
  // to refresh after a new call lands.
  const [recordVersion, setRecordVersion] = useState(0)

  async function generate({ productName, productDescription, tone, formatId, setCopy, bannerId }) {
    setLoading(true)
    setError(null)
    try {
      const { copy, usage } = await generateBannerCopy({ productName, productDescription, tone, formatId })
      setCopy(copy)
      // Persist cost record. Tied to the active banner session via bannerId.
      if (bannerId && usage) {
        recordGeneration({
          bannerId,
          productName,
          formatId,
          model: usage.model,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        })
        setRecordVersion(v => v + 1)
      }
    } catch (e) {
      setError(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error, recordVersion }
}
