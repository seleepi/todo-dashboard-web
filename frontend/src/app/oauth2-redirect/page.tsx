'use client'

import { useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

/*
OAuth2 표준 PKCE (Proof Key for Code Exchange) 방식
인증 코드를 더 안전하게 교환하기 위한 추가 보안
1. 로그인 시작(LoginForm.tsx)
2. PocketBase 서버에 OAuth 정보 요청 (pocketbase.ts)
    → 서버가 생성한 codeVerifier를 브라우저에 저장 (verifier는 나만 볼 수 있음)
    → 구글 로그인 팝업 열기
3. 사용자가 구글 로그인 완료 후 OAuth2Redirect 페이지(page.tsx) 열림
4. 리다이렉트 페이지 url에서 구글이 추가한 코드 추출 (코드는 누구나 볼 수 있음)
5. PocketBase 서버에 토큰 요청 (page.tsx)
    → code + codeVerifier 함께 전송
6. pocketbase 서버가 구글에 액세스 토큰 요청
    → 구글이 code + codeVerifier 일치 확인
    → 일치하면 진짜 토큰 반환
    → PocketBase가 받은 토큰을 page.tsx에 응답\
7. page.tsx가 토큰 저장 + 부모 창(LoginForm)에 성공 메시지 전송
    → 팝업 닫힘
    → 앱 로그인 완료!
*/

export default function OAuth2Redirect() {
  useEffect(() => {
    handleOAuth2Redirect()
  }, []) // []는 의존성 배열, 배열에 값이 없으면 컴포넌트가 처음 나타날 때 한 번만 실행, 배열에 값이 있으면 값이 바뀔 때마다 실행

  // 헬퍼 함수: 부모 창에 메시지 보내고 닫기
  // const: 상수 선언(값이 안 바뀜)
  // =: 함수를 변수에 할당
  // 함수의 파라미터는 2개, 첫 파라미터: 타입스크립트 타입으로 'type' 변수는 두 개의 문자열 중 하나여야 한다.
  const closeWithMessage = (type: 'oauth2-success' | 'oauth2-error', payload: any) => {
    if (window.opener) {    // window.opener는 현재 창을 연 부모 창을 의미, URL로 접속했다면 부모 창이 없어 null
      window.opener.postMessage({ type, ...payload }, window.location.origin)   // 부모 창에 메시지 보내기, ...는 spread 연산자로 {} 안의 내용물 풀어씀
    }
    window.close()
  }

  // async는 함수가 (시간이 걸리는) 비동기 작업을 한다는 표시, await(if, new, return과 같은 js 키워드)을 쓸 수 있다
  const handleOAuth2Redirect = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search) // search는 url의 쿼리 스트링(?부터 그 뒷부분)
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
      const storedState = sessionStorage.getItem('oauth_state') // sessionStorage: 브라우저의 임시 저장소, pockebase.ts에서 저장한 google oauth 정보
      if (!state || !storedState || storedState !== state) {    // 저장된 정보와 url에서 추출한 정보가 일치하는지 확인
        closeWithMessage('oauth2-error', {
          error: '보안 검증에 실패했습니다'
        })
        return
      }

      // 4. PocketBase 인증
      const storedCodeVerifier = sessionStorage.getItem('oauth_code_verifier')  // pocketbase.ts가 브라우저에 저장한 verifier 가져오기
      // pocketbase api 호출 (fetch: HTTP 요청을 보내는 브라우저 내장 함수, 서버와 통신할 때 사용)
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

      if (!authResponse.ok) {   // HTTP 상태코드가 실패나 에러일 때
        const errorText = await authResponse.text()
        throw new Error(`인증 실패 (${authResponse.status}): ${errorText}`)
      }

      // 응답 데이터 파싱
      const authData = await authResponse.json()

      // 5. 인증 정보 저장(토큰과 유저 데이터)
      pb.authStore.save(authData.token, authData.record)    // authStore: pocketbase 클라이언트의 인증 저장소, 로그인 상태 관리

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