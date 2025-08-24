'use client'

import { useState, useEffect } from 'react'
import { pb } from '@/lib/pocketbase'

interface Dashboard {
  id: string
  name: string
  background: string
}

interface DashboardSelectorProps {
  onDashboardSelect: (dashboard: Dashboard) => void
  onLogout: () => void
}

export default function DashboardSelector({ onDashboardSelect, onLogout }: DashboardSelectorProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboards()
  }, [])

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
      setError('대시보드를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    pb.authStore.clear()
    onLogout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">대시보드를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            대시보드 선택
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            사용할 대시보드를 선택해주세요
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {dashboards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              사용 가능한 대시보드가 없습니다.
            </div>
          ) : (
            dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => onDashboardSelect(dashboard)}
                className="w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {dashboard.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {dashboard.id}
                    </p>
                  </div>
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: dashboard.background }}
                  />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}