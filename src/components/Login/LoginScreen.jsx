import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

function Label({ children }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
      {children}
    </label>
  )
}

function Input(props) {
  return (
    <input
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-600 transition-colors"
      {...props}
    />
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SectionDivider({ children }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
      <span className="flex-1 h-px bg-gray-800" />
      {children}
      <span className="flex-1 h-px bg-gray-800" />
    </h3>
  )
}

export default function LoginScreen() {
  const { signIn, completeNewPassword, pendingPasswordChange } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      // If newPasswordRequired, the AuthContext flips pendingPasswordChange
      // and we re-render into the new-password form below.
    } catch (err) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleNewPassword(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await completeNewPassword(newPassword)
    } catch (err) {
      setError(err.message || 'Could not set new password')
    } finally {
      setLoading(false)
    }
  }

  const isNewPasswordStep = pendingPasswordChange

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Meta Ad Banner Generator
          </h1>
          <p className="text-xs text-gray-500 mt-1">AI-Powered · Ethnic & Saree Brands</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <SectionDivider>{isNewPasswordStep ? 'Set New Password' : 'Sign In'}</SectionDivider>

          {isNewPasswordStep ? (
            <form onSubmit={handleNewPassword} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                This is your first sign-in. Choose a permanent password — at least 10 characters with uppercase,
                lowercase, and a number.
              </p>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 10 characters"
                  required
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    Setting password...
                  </>
                ) : (
                  'Set Password & Continue'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <SpinnerIcon />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {error && <p className="text-xs text-red-400 mt-4">{error}</p>}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Internal access only · Contact your administrator for an account
        </p>
      </div>
    </div>
  )
}
