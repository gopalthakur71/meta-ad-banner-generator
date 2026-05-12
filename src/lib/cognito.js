import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js'

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
})

function newCognitoUser(email) {
  return new CognitoUser({ Username: email, Pool: userPool })
}

// Returns either:
//   { kind: 'ok', user, session, idToken }
//   { kind: 'new_password_required', user, userAttributes }  ← first login for admin-invited users
// Throws on any other failure.
export function signIn(email, password) {
  const user = newCognitoUser(email)
  const auth = new AuthenticationDetails({ Username: email, Password: password })

  return new Promise((resolve, reject) => {
    user.authenticateUser(auth, {
      onSuccess: (session) => {
        resolve({
          kind: 'ok',
          user,
          session,
          idToken: session.getIdToken().getJwtToken(),
        })
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: (userAttributes) => {
        // Cognito returns email/email_verified here, but it rejects them on
        // completeNewPasswordChallenge. Strip them.
        delete userAttributes.email
        delete userAttributes.email_verified
        resolve({ kind: 'new_password_required', user, userAttributes })
      },
    })
  })
}

export function completeNewPassword(user, newPassword, userAttributes) {
  return new Promise((resolve, reject) => {
    user.completeNewPasswordChallenge(newPassword, userAttributes, {
      onSuccess: (session) =>
        resolve({
          user,
          session,
          idToken: session.getIdToken().getJwtToken(),
        }),
      onFailure: (err) => reject(err),
    })
  })
}

// Restore session from localStorage on app boot. Returns null if no session.
export function getCurrentSession() {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser()
    if (!user) return resolve(null)

    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null)
      resolve({
        user,
        session,
        idToken: session.getIdToken().getJwtToken(),
        email: session.getIdToken().payload.email,
      })
    })
  })
}

export function signOut() {
  const user = userPool.getCurrentUser()
  if (user) user.signOut()
}
