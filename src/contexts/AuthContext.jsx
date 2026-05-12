import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { signIn, completeNewPassword, getCurrentSession, signOut } from '../lib/cognito'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // null = not signed in. Object = { email, getIdToken() }.
  const [auth, setAuth] = useState(null)
  // Tracks the initial getCurrentSession() check so we don't flash the
  // login screen for users who already have a valid cached session.
  const [bootstrapping, setBootstrapping] = useState(true)
  // Holds the Cognito CognitoUser between signIn() and completeNewPassword()
  // when the user is on their forced-password-change flow.
  const [pendingPasswordChange, setPendingPasswordChange] = useState(null)

  useEffect(() => {
    getCurrentSession().then((s) => {
      if (s) {
        setAuth({
          email: s.email,
          getIdToken: () => freshIdToken(s.user),
        })
      }
      setBootstrapping(false)
    })
  }, [])

  const handleSignIn = useCallback(async (email, password) => {
    const result = await signIn(email, password)
    if (result.kind === 'new_password_required') {
      setPendingPasswordChange({ user: result.user, attrs: result.userAttributes })
      return { newPasswordRequired: true }
    }
    setAuth({
      email,
      getIdToken: () => freshIdToken(result.user),
    })
    return { newPasswordRequired: false }
  }, [])

  const handleCompleteNewPassword = useCallback(async (newPassword) => {
    if (!pendingPasswordChange) throw new Error('No pending password change')
    const { user, attrs } = pendingPasswordChange
    const result = await completeNewPassword(user, newPassword, attrs)
    setPendingPasswordChange(null)
    setAuth({
      email: result.session.getIdToken().payload.email,
      getIdToken: () => freshIdToken(result.user),
    })
  }, [pendingPasswordChange])

  const handleSignOut = useCallback(() => {
    signOut()
    setAuth(null)
    setPendingPasswordChange(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        auth,
        bootstrapping,
        pendingPasswordChange: !!pendingPasswordChange,
        signIn: handleSignIn,
        completeNewPassword: handleCompleteNewPassword,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// Returns a Promise<string> with a current valid ID token. The Cognito SDK
// auto-refreshes from the refresh token if the access/id tokens have expired.
function freshIdToken(user) {
  return new Promise((resolve, reject) => {
    user.getSession((err, session) => {
      if (err || !session?.isValid()) return reject(err || new Error('Session invalid'))
      resolve(session.getIdToken().getJwtToken())
    })
  })
}
