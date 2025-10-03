'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

export default function OAuth2Redirect() {
  useEffect(() => {
    handleOAuth2Redirect()
  }, [])

  // 헬퍼 함수: 부모 창에 메시지 보내고 닫기
  const closeWithMessage = (type: 'oauth2-success' | 'oauth2-error', payload: any) => {
    if (window.opener) {
      window.opener.postMessage({ type, ...payload }, window.location.origin)
    }
    window.close()
  }

  const handleOAuth2Redirect = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')

      // 1. OAuth 제공자 에러 체크
      if (error) {
        closeWithMessage('oauth2-error', {
          error: `로그인 실패: ${errorDescription || error}`
        })
        return
      }

      // 2. 인증 코드 체크
      if (!code) {
        closeWithMessage('oauth2-error', {
          error: '인증 코드를 받지 못했습니다'
        })
        return
      }

      // 3. State 보안 검증 (CSRF 방지)
      const storedState = sessionStorage.getItem('oauth_state')
      if (!state || !storedState || storedState !== state) {
        closeWithMessage('oauth2-error', {
          error: '보안 검증에 실패했습니다'
        })
        return
      }

      // 4. PocketBase 인증
      const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier')
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

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        throw new Error(`인증 실패 (${authResponse.status}): ${errorText}`)
      }

      const authData = await authResponse.json()

      // 5. 인증 정보 저장
      pb.authStore.save(authData.token, authData.record)

      // 6. 임시 데이터 정리
      sessionStorage.removeItem('oauth_code_verifier')
      sessionStorage.removeItem('oauth_state')

      // 7. 성공 메시지 전송
      closeWithMessage('oauth2-success', { user: authData.record })

    } catch (error) {
      // 모든 에러를 한 곳에서 처리
      closeWithMessage('oauth2-error', {
        error: error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">인증 처리 중...</p>
      </div>
    </div>
  )
}