'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

/*
OAuth2 Standard PKCE (Proof Key for Code Exchange) Flow
Additional security for safer exchange of authorization codes
1. Login initiation (LoginForm.tsx)
2. Request OAuth info from PocketBase server (pocketbase.ts)
    → Store server-generated codeVerifier in browser (verifier is private to user)
    → Open Google login popup
3. After user completes Google login, OAuth2Redirect page (page.tsx) opens
4. Extract code added by Google from redirect page URL (code is publicly visible)
5. Request token from PocketBase server (page.tsx)
    → Send code + codeVerifier together
6. PocketBase server requests access token from Google
    → Google verifies code + codeVerifier match
    → If matched, returns real token
    → PocketBase responds to page.tsx with received token
7. page.tsx saves token + sends success message to parent window (LoginForm)
    → Popup closes
    → App login complete!
*/

export default function OAuth2Redirect() {
  useEffect(() => {
    handleOAuth2Redirect()
  }, []) // [] is dependency array, empty array means run once when component first appears, if array has values then run whenever values change

  // Helper function: send message to parent window and close
  // const: constant declaration (value doesn't change)
  // =: assign function to variable
  // Function has 2 parameters, first parameter: TypeScript type where 'type' variable must be one of two strings
  const closeWithMessage = (type: 'oauth2-success' | 'oauth2-error', payload: any) => {
    if (window.opener) {    // window.opener refers to the parent window that opened current window, null if accessed directly via URL
      window.opener.postMessage({ type, ...payload }, window.location.origin)   // Send message to parent window, ... is spread operator that unpacks contents of {}
    }
    window.close()
  }

  // async indicates function performs (time-consuming) asynchronous operations, allows using await (a JS keyword like if, new, return)
  const handleOAuth2Redirect = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search) // search is the query string part of URL (from ? onwards)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')

      // 1. Check OAuth provider error
      if (error) {
        closeWithMessage('oauth2-error', {
          error: `Login failed: ${errorDescription || error}`
        })
        return
      }

      // 2. Check authorization code
      if (!code) {
        closeWithMessage('oauth2-error', {
          error: 'Did not receive authorization code'
        })
        return
      }

      // 3. State security verification (CSRF prevention)
      const storedState = sessionStorage.getItem('oauth_state') // sessionStorage: browser's temporary storage, contains google oauth info saved by pocketbase.ts
      if (!state || !storedState || storedState !== state) {    // Verify that stored info matches info extracted from URL
        closeWithMessage('oauth2-error', {
          error: 'Security verification failed'
        })
        return
      }

      // 4. PocketBase authentication
      const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier')  // Get verifier stored in browser by pocketbase.ts
      // Call pocketbase API (fetch: browser's built-in function for sending HTTP requests, used for server communication)
      const authResponse = await fetch(
        `${pb.baseUrl}/api/collections/users/auth-with-oauth2`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'google',
            code,
            codeVerifier: storedCodeVerifier || '',
            redirectUrl: window.location.href.split('?')[0]
          })
        }
      )

      if (!authResponse.ok) {   // When HTTP status code indicates failure or error
        const errorText = await authResponse.text()
        throw new Error(`Authentication failed (${authResponse.status}): ${errorText}`)
      }

      // Parse response data
      const authData = await authResponse.json()

      // 5. Save authentication info (token and user data)
      pb.authStore.save(authData.token, authData.record)    // authStore: pocketbase client's authentication storage, manages login state

      // 6. Clean up temporary data
      sessionStorage.removeItem('oauth_code_verifier')
      sessionStorage.removeItem('oauth_state')

      // 7. Send success message
      closeWithMessage('oauth2-success', { user: authData.record })

    } catch (error) {
      // Handle all errors in one place
      closeWithMessage('oauth2-error', {
        error: error instanceof Error ? error.message : 'An error occurred during authentication processing'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}