'use client'

import { useState, useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

interface Dashboard {
  id: string
  name: string
  background: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentDashboard: Dashboard | null
  onDashboardSelect: (dashboard: Dashboard) => void
  onLogout: () => void
}

export default function Sidebar({
  isOpen,
  onClose,
  currentDashboard,
  onDashboardSelect,
  onLogout
}: SidebarProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadDashboards()
    }
  }, [isOpen])

  const loadDashboards = async () => {
    try {
      setIsLoading(true)
      const records = await pb.collection('dashboards').getFullList({
        sort: '-created',
      })

      setDashboards(records.map(record => ({
        id: record.id,
        name: record.name,
        background: record.background || '#f0f9ff'
      })))
    } catch (err) {
      console.error('Failed to load dashboards:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createDashboard = async () => {
    if (!newDashboardName.trim()) return

    try {
      setIsCreating(true)
      const user = pb.authStore.model
      if (!user) return

      const newDashboard = await pb.collection('dashboards').create({
        user: user.id,
        name: newDashboardName.trim(),
        background: '#f0f9ff'
      })

      const dashboardData = {
        id: newDashboard.id,
        name: newDashboard.name,
        background: newDashboard.background || '#f0f9ff'
      }

      setDashboards(prev => [dashboardData, ...prev])
      setNewDashboardName('')
      setShowCreateForm(false)
      onDashboardSelect(dashboardData)
      onClose()
    } catch (err) {
      console.error('Failed to create dashboard:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = () => {
    pb.authStore.clear()
    onLogout()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">대시보드</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Create Dashboard */}
            <div className="mb-6">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 대시보드
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="대시보드 이름"
                    value={newDashboardName}
                    onChange={(e) => setNewDashboardName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isCreating) {
                        createDashboard()
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    disabled={isCreating}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createDashboard}
                      disabled={isCreating || !newDashboardName.trim()}
                      className="flex-1 py-2 px-3 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? '생성 중...' : '생성'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewDashboardName('')
                      }}
                      disabled={isCreating}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard List */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">내 대시보드</h3>
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  로딩 중...
                </div>
              ) : dashboards.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  대시보드가 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {dashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => {
                        onDashboardSelect(dashboard)
                        onClose()
                      }}
                      className={`
                        w-full p-3 text-left rounded-lg transition-colors
                        ${currentDashboard?.id === dashboard.id
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                          : 'hover:bg-gray-50 border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{dashboard.name}</p>
                          <p className="text-xs text-gray-500 truncate">ID: {dashboard.id}</p>
                        </div>
                        <div
                          className="w-4 h-4 rounded border border-gray-300 ml-2 flex-shrink-0"
                          style={{ backgroundColor: dashboard.background }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </>
  )
}