'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

export default function OAuth2Redirect() {
  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (code && state) {
          // Complete the OAuth2 flow
          const authData = await pb.collection('users').authWithOAuth2Code(
            'google',
            code,
            '',
            window.location.origin + '/oauth2-redirect'
          )

          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth2-success',
              user: authData.record
            }, window.location.origin)
          }

          // Close the popup
          window.close()
        } else {
          // Handle error
          const error = urlParams.get('error') || 'OAuth2 authentication failed'

          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth2-error',
              error: error
            }, window.location.origin)
          }

          window.close()
        }
      } catch (error) {
        console.error('OAuth2 redirect error:', error)

        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth2-error',
            error: error instanceof Error ? error.message : 'Authentication failed'
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