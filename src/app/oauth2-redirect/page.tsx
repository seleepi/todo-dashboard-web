'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

export default function OAuth2Redirect() {
  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        console.log('=== OAuth2 redirect page loaded ===')
        console.log('Current URL:', window.location.href)
        console.log('PocketBase URL:', pb.baseUrl)
        console.log('Auth store valid before:', pb.authStore.isValid)
        console.log('Auth store model before:', pb.authStore.model)

        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        console.log('URL Parameters:', {
          code: code ? `${code.substring(0, 10)}...` : null,
          state,
          error,
          errorDescription
        })

        if (error) {
          console.error('OAuth2 error from provider:', error, errorDescription)

          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth2-error',
              error: `OAuth2 provider error: ${error} - ${errorDescription || 'Unknown error'}`
            }, window.location.origin)
          }

          window.close()
          return
        }

        if (code) {
          console.log('Authorization code received, completing OAuth2 flow...')
          console.log('Authorization code (first 10 chars):', code.substring(0, 10))
          console.log('State:', state)

          // Get the stored codeVerifier from sessionStorage
          const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier') || '';
          const storedState = sessionStorage.getItem('oauth_state') || '';

          console.log('Retrieved from sessionStorage:')
          console.log('- codeVerifier:', storedCodeVerifier ? storedCodeVerifier.substring(0, 10) + '...' : 'EMPTY')
          console.log('- storedState:', storedState)
          console.log('- receivedState:', state)

          // Verify state matches (security check)
          if (storedState && state && storedState !== state) {
            console.error('OAuth state mismatch! Possible CSRF attack.')
            throw new Error('OAuth state verification failed')
          }

          try {
            console.log('Calling pb.collection(users).authWithOAuth2Code with:')
            console.log('- provider: google')
            console.log('- code:', code.substring(0, 10) + '...')
            console.log('- codeVerifier:', storedCodeVerifier ? storedCodeVerifier.substring(0, 10) + '...' : 'EMPTY')
            console.log('- redirectUrl:', window.location.href.split('?')[0])

            // Complete the OAuth2 flow
            const authData = await pb.collection('users').authWithOAuth2Code(
              'google',
              code,
              storedCodeVerifier, // Use the stored codeVerifier
              window.location.href.split('?')[0] // Use current URL without query params
            )

            console.log('OAuth2 authentication successful!')
            console.log('Auth data:', authData)
            console.log('User record:', authData.record)
            console.log('Auth store valid after:', pb.authStore.isValid)
            console.log('Auth store model after:', pb.authStore.model)

            // Clean up sessionStorage
            sessionStorage.removeItem('oauth_code_verifier')
            sessionStorage.removeItem('oauth_state')
            console.log('Cleaned up OAuth sessionStorage')

            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth2-success',
                user: authData.record
              }, window.location.origin)
            }

            // PocketBase auth should now be stored automatically
            window.close()
          } catch (authError) {
            console.error('OAuth2 code exchange failed:', authError)
            console.error('Error details:', {
              message: authError instanceof Error ? authError.message : 'Unknown error',
              stack: authError instanceof Error ? authError.stack : undefined,
              response: (authError as any)?.response,
              status: (authError as any)?.status,
              data: (authError as any)?.data
            })

            // Send error message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth2-error',
                error: `OAuth2 code exchange failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`
              }, window.location.origin)
            }

            window.close()
          }
        } else {
          console.error('No authorization code or error received')

          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth2-error',
              error: 'No authorization code received'
            }, window.location.origin)
          }

          window.close()
        }
      } catch (error) {
        console.error('OAuth2 redirect error:', error)

        const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
        console.error('Error details:', errorMessage)

        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth2-error',
            error: `OAuth2 completion failed: ${errorMessage}`
          }, window.location.origin)
        }

        window.close()
      }
    }

    handleOAuth2Redirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">인증 처리 중...</p>
      </div>
    </div>
  )
}