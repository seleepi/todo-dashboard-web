'use client' // Tells Next.js "this file contains code that runs in the browser!"
// Required when using React state or events

// useState: functionality to store and change variable values
// useEffect: write code to execute when component appears on screen
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

// Main function for this page, export means "make this function available for use elsewhere"
// Page component must be exported as default, though named exports are usually recommended
export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardData | null>(null)    // Must be either DashboardData type or null
  const [isLoading, setIsLoading] = useState(true)

  // Execute when page first appears on screen
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
    // Remove event listener when component disappears
    return () => {
        unsubscribe()
    }
  }, [])    // [] means "execute only when page first loads"
  // End of useEffect

  // Event handler functions
  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleDashboardSelect = (dashboard: DashboardData) => {
    setSelectedDashboard(dashboard)
  }

  const handleLogout = () => {
    pb.authStore.clear()  // Delete login information stored in PocketBase
    setIsAuthenticated(false)
    setSelectedDashboard(null)
  }

  // Section that determines what to show on screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-700">Loading...</div>
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
  // If all conditions are met (logged in and dashboard selected), call Dashboard function to render actual dashboard
  // page controls overall app flow and manages dashboard login status / dashboard selection and switching / loading state - manages which screen to show
  // dashboard manages internal widget list and state, grid, sidebar open/close - manages what's in its own dashboard object
  return (
    <Dashboard
      key={selectedDashboard.id} // Key for react, not for dashboard. Force component remount when dashboard changes
      dashboardId={selectedDashboard.id}    // Identifier for loading dashboard data
      currentDashboard={selectedDashboard}
      onDashboardChange={handleDashboardSelect} // These attached functions are callback functions that allow dashboard to report events to page
      onLogout={handleLogout}
    />
  )
}
