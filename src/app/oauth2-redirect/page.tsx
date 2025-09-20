'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

export default function OAuth2Redirect() {
  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        console.log('OAuth2 redirect page loaded')
        console.log('Current URL:', window.location.href)

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

          try {
            // Complete the OAuth2 flow
            const authData = await pb.collection('users').authWithOAuth2Code(
              'google',
              code,
              '',
              window.location.href.split('?')[0] // Use current URL without query params
            )

            console.log('OAuth2 authentication successful:', authData.record)

            // PocketBase auth should now be stored automatically
            // Just close the popup and let the parent check auth status
            window.close()
          } catch (authError) {
            console.error('OAuth2 code exchange failed:', authError)

            // Try alternative approach - close popup and let parent check
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