'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

export default function OAuth2Redirect() {
  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
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
          // Get stored OAuth credentials
          const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier') || '';
          const storedState = sessionStorage.getItem('oauth_state') || '';

          // Verify state for security
          if (storedState && state && storedState !== state) {
            throw new Error('OAuth state verification failed')
          }

          try {
            // Complete OAuth2 flow with PocketBase
            const authResponse = await fetch(`${pb.baseUrl}/api/collections/users/auth-with-oauth2`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                provider: 'google',
                code: code,
                codeVerifier: storedCodeVerifier,
                redirectUrl: window.location.href.split('?')[0]
              })
            });

            if (!authResponse.ok) {
              const errorData = await authResponse.text();
              throw new Error(`PocketBase auth failed: ${authResponse.status} - ${errorData}`);
            }

            const authData = await authResponse.json();

            // Update PocketBase auth store
            pb.authStore.save(authData.token, authData.record);

            // Clean up sessionStorage
            sessionStorage.removeItem('oauth_code_verifier')
            sessionStorage.removeItem('oauth_state')

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
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth2-error',
                error: `OAuth2 code exchange failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`
              }, window.location.origin)
            }
            window.close()
          }
        } else {
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth2-error',
              error: 'No authorization code received'
            }, window.location.origin)
          }
          window.close()
        }
      } catch (error) {
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth2-error',
            error: `OAuth2 completion failed: ${error instanceof Error ? error.message : 'Authentication failed'}`
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