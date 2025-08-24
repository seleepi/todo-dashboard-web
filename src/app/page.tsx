'use client'

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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      setIsAuthenticated(pb.authStore.isValid)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    pb.authStore.onChange(() => {
      const isValid = pb.authStore.isValid
      setIsAuthenticated(isValid)
      if (!isValid) {
        setSelectedDashboard(null)
      }
    })
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleDashboardSelect = (dashboard: DashboardData) => {
    setSelectedDashboard(dashboard)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setSelectedDashboard(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
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

  return <Dashboard dashboardId={selectedDashboard.id} />
}
