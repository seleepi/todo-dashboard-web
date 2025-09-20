'use client'

import { useState } from 'react'
import { pb } from '@/lib/pocketbase'

export default function OAuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkOAuthConfig = async () => {
    setLoading(true)
    try {
      console.log('Checking PocketBase OAuth configuration...')
      console.log('PocketBase URL:', pb.baseUrl)

      // PocketBase 연결 테스트
      const response = await fetch(`${pb.baseUrl}/api/collections/users/auth-methods`)
      console.log('Raw response status:', response.status)
      console.log('Raw response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const authMethods = await response.json()
      console.log('Raw auth methods response:', authMethods)

      const debugData = {
        pocketbaseUrl: pb.baseUrl,
        responseStatus: response.status,
        authMethods: authMethods,
        authProviders: authMethods.authProviders || [],
        googleProvider: authMethods.authProviders?.find((p: any) => p.name === 'google'),
        usernamePassword: authMethods.usernamePassword,
        emailPassword: authMethods.emailPassword,
        timestamp: new Date().toISOString()
      }

      console.log('Debug data:', debugData)
      setDebugInfo(debugData)
    } catch (error) {
      console.error('Debug check failed:', error)
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        pocketbaseUrl: pb.baseUrl,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">OAuth 설정 디버깅</h3>

      <button
        onClick={checkOAuthConfig}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '확인 중...' : 'OAuth 설정 확인'}
      </button>

      {debugInfo && (
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">디버그 정보:</h4>
          <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>

          {debugInfo.error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
              <strong>오류:</strong> {debugInfo.error}
            </div>
          )}

          {debugInfo.googleProvider ? (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
              <strong>✅ Google OAuth 설정됨</strong>
              <br />
              Auth URL: {debugInfo.googleProvider.authUrl}
            </div>
          ) : (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <strong>⚠️ Google OAuth 미설정</strong>
              <br />
              PocketBase 관리자 패널에서 Google OAuth를 활성화해주세요.
            </div>
          )}
        </div>
      )}
    </div>
  )
}