'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Activity } from '@/types/api'
import { ActivityType, EntityType } from '@/types/api'
import { 
  ListIcon, 
  CheckIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon,
  RefreshIcon
} from '@/components/ui/icons'

interface RecentActivitiesProps {
  limit?: number
  className?: string
}

export function RecentActivities({ limit = 10, className = '' }: RecentActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadActivities()
  }, [limit])

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.getRecentActivities(limit)
      
      setActivities(response.activities)
      setTotalCount(response.totalCount)
    } catch (err) {
      console.error('❌ Failed to load activities:', err)
      setError('Failed to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (activityType: number) => {
    switch (activityType) {
      case ActivityType.Created:
        return <PlusIcon className="w-4 h-4 text-green-500" />
      case ActivityType.Updated:
        return <EditIcon className="w-4 h-4 text-blue-500" />
      case ActivityType.Deleted:
        return <TrashIcon className="w-4 h-4 text-red-500" />
      case ActivityType.Completed:
        return <CheckIcon className="w-4 h-4 text-emerald-500" />
      case ActivityType.Reopened:
        return <RefreshIcon className="w-4 h-4 text-orange-500" />
      case ActivityType.ItemAdded:
        return <PlusIcon className="w-4 h-4 text-green-500" />
      case ActivityType.ItemUpdated:
        return <EditIcon className="w-4 h-4 text-blue-500" />
      case ActivityType.ItemDeleted:
        return <TrashIcon className="w-4 h-4 text-red-500" />
      case ActivityType.ItemCompleted:
        return <CheckIcon className="w-4 h-4 text-emerald-500" />
      case ActivityType.ItemReopened:
        return <RefreshIcon className="w-4 h-4 text-orange-500" />
      default:
        return <ListIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (activityType: number) => {
    switch (activityType) {
      case ActivityType.Created:
      case ActivityType.ItemAdded:
        return 'from-green-50 to-emerald-50 border-green-200/50'
      case ActivityType.Updated:
      case ActivityType.ItemUpdated:
        return 'from-blue-50 to-indigo-50 border-blue-200/50'
      case ActivityType.Deleted:
      case ActivityType.ItemDeleted:
        return 'from-red-50 to-pink-50 border-red-200/50'
      case ActivityType.Completed:
      case ActivityType.ItemCompleted:
        return 'from-emerald-50 to-green-50 border-emerald-200/50'
      case ActivityType.Reopened:
      case ActivityType.ItemReopened:
        return 'from-orange-50 to-yellow-50 border-orange-200/50'
      default:
        return 'from-gray-50 to-slate-50 border-gray-200/50'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const activityDate = new Date(dateString)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return activityDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-3 p-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium mb-3">{error}</p>
            <button
              onClick={loadActivities}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount > 0 ? `${activities.length} of ${totalCount} activities` : 'No activities yet'}
          </p>
        </div>
        
        <button
          onClick={loadActivities}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors group"
          title="Refresh activities"
        >
          <RefreshIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <ListIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
          <p className="text-gray-500">
            Start creating todo lists and completing tasks to see activity here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group relative"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getActivityColor(activity.activityType)} rounded-xl opacity-50`}></div>
              
              {/* Content */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 hover:shadow-md transition-all duration-300 group-hover:border-gray-300">
                <div className="flex items-start space-x-3">
                  {/* User Avatar & Activity Icon */}
                  <div className="relative flex-shrink-0">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      style={{ backgroundColor: activity.userColorCode }}
                    >
                      {activity.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {getActivityIcon(activity.activityType)}
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium line-clamp-2">
                          {activity.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-medium text-gray-600">
                            {activity.username}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                                                     <span className="text-xs text-gray-500">
                             {activity.entityType === EntityType.TodoList ? 'List' : 'Item'}
                           </span>
                        </div>
                      </div>
                      
                      <span className="text-xs text-gray-500 font-medium ml-2 flex-shrink-0">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 