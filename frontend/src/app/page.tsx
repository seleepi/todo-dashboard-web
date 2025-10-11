'use client' // Next.js에게 "이 파일은 브라우저에서 실행되는 코드야!"라고 알려주는 거
//React의 상태(state)나 이벤트를 사용할 때 필요

// useState: 변수의 값을 저장하고 바꾸는 기능
// useEffect: 컴포넌트가 화면에 나타날 때 실행할 코드 작성
import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/layout/Dashboard'
import LoginForm from '@/components/auth/LoginForm'
import DashboardSelector from '@/components/layout/DashboardSelector'
import { pb } from '@/lib/pocketbase'

interface DashboardData {
  id: string
  name: string
  background: string
}

// 이 페이지의 메인함수, export는 "이 함수를 다른 곳에서 사용할 수 있게 내보내기"
// page 컴포넌트는 default로 내보내야 함, 보통은 named 권장
export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardData | null>(null)    // DashboardData 타입이거나 null이어야 함
  const [isLoading, setIsLoading] = useState(true)

  // 페이지가 처음 화면에 나타날 때 실행
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      setIsAuthenticated(pb.authStore.isValid)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes and save cleanup function to variable 'unsubscribe'
    const unsubscribe = pb.authStore.onChange(() => {
      const isValid = pb.authStore.isValid
      setIsAuthenticated(isValid)
      if (!isValid) {
        setSelectedDashboard(null)
      }
    })
    // 컴포넌트가 사라질 때 이벤트 리스너 제거
    return () => {
        unsubscribe()
    }
  }, [])    // []는 "페이지가 처음 로드될 때만 실행해라"는 뜻
  // useEffect의 끝부분

  // 이벤트 처리 함수들
  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleDashboardSelect = (dashboard: DashboardData) => {
    setSelectedDashboard(dashboard)
  }

  const handleLogout = () => {
    pb.authStore.clear()  // PocketBase에 저장된 로그인 정보 삭제
    setIsAuthenticated(false)
    setSelectedDashboard(null)
  }

  // 화면에 무엇을 보여줄지 결정하는 부분
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  if (!selectedDashboard) {
    return (
      <DashboardSelector 
        onDashboardSelect={handleDashboardSelect}
        onLogout={handleLogout}
      />
    )
  }
  // 모든 조건을 통과했으면 (로그인도 했고, 대시보드도 선택했으면) Dashboard 함수를 호출하여 실제 대시보드 렌더링
  // page는 전체 앱의 흐름을 제어하고 대시보드의 로그인 여부 / 대시보드 선택 및 전환 / 로딩 상태를 관리 - 어떤 화면을 보여줄 지 관리
  // dashboard는 대시보드 내부적인 위젯 목록과 상태, 그리드, 사이드바 열림/닫힘 관리 - 자기 대시보드 객체에 무엇이 있는지 관리
  return (
    <Dashboard
      key={selectedDashboard.id} // Key for react, not for dashboard. Force component remount when dashboard changes
      dashboardId={selectedDashboard.id}    // 대시보드 데이터 로드용 식별자
      currentDashboard={selectedDashboard}
      onDashboardChange={handleDashboardSelect} // 이 첨부된 함수들은 dashboard가 page에게 이벤트를 보고할 수 있게 하는 콜백 함수
      onLogout={handleLogout}
    />
  )
}
