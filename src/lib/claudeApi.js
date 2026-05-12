import { getCurrentSession } from './cognito'

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT

export async function generateBannerCopy({ productName, productDescription, tone, formatId }) {
  const session = await getCurrentSession()
  if (!session) throw new Error('Not signed in')

  const res = await fetch(`${API_ENDPOINT}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.idToken}`,
    },
    body: JSON.stringify({ productName, productDescription, tone, formatId }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body.error || JSON.stringify(body)
    } catch {
      detail = await res.text()
    }
    throw new Error(`Generation failed (${res.status}): ${detail}`)
  }

  // Lambda returns { copy, usage } — same shape the old SDK path returned.
  return res.json()
}
