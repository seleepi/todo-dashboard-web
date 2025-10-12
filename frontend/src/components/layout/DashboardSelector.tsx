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
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
      setError('Failed to load dashboards.')
    } finally {
      setIsLoading(false)
    }
  }

  const createDashboard = async () => {
    if (!newDashboardName.trim()) {
      setError('Please enter a dashboard name.')
      return
    }

    try {
      setIsCreating(true)
      setError('')

      const user = pb.authStore.model
      if (!user) {
        setError('User authentication is required.')
        return
      }

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

      // Navigate directly to the newly created dashboard
      onDashboardSelect(dashboardData)
    } catch (err) {
      console.error('Failed to create dashboard:', err)
      setError('Failed to create dashboard.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = () => {
    pb.authStore.clear()
    onLogout()
  }

  const deleteDashboard = async (dashboardId: string) => {
    try {
      setIsDeleting(true)
      setError('')

      await pb.collection('dashboards').delete(dashboardId)

      setDashboards(prev => prev.filter(d => d.id !== dashboardId))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Failed to delete dashboard:', err)
      setError('Failed to delete dashboard.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-700">Loading dashboards...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Select Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select a dashboard to use
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* Dashboard creation button */}
        <div className="mb-6">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Dashboard
              </div>
            </button>
          ) : (
            <div className="p-4 border border-gray-300 rounded-lg">
              <input
                type="text"
                placeholder="Enter dashboard name"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isCreating) {
                    createDashboard()
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                disabled={isCreating}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={createDashboard}
                  disabled={isCreating || !newDashboardName.trim()}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewDashboardName('')
                    setError('')
                  }}
                  disabled={isCreating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {dashboards.length === 0 && !showCreateForm ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No dashboards available.</p>
              <p className="text-sm">Click the button above to create your first dashboard!</p>
            </div>
          ) : (
            dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="relative w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => onDashboardSelect(dashboard)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                >
                  <div className="flex items-center justify-between pr-8">
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
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirmId(dashboard.id)
                  }}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Dashboard
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this dashboard? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteDashboard(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}