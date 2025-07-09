'use client'

import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import { 
  HeartIcon, 
  ListIcon, 
  CheckIcon, 
  TargetIcon, 
  UserIcon,
  PlusIcon,
  ShareIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { DashboardStats, Activity, TodoList, Partner } from '@/types/api'

interface DashboardData {
  stats: DashboardStats
  activities: Activity[]
  recentLists: TodoList[]
  partner?: Partner
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Auth henüz yükleniyor, bekle
    if (authLoading) return
    
    // Auth yüklendi ve user yok, login'e yönlendir
    if (!user) {
      console.log('👋 User yok, login\'e yönlendiriliyor...')
      router.push('/auth/login')
      return
    }
    
    console.log('✅ User var, dashboard verisi yükleniyor...', user)

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        console.log('📊 Dashboard verisi yükleniyor...')
        
        // Real API calls
        const [stats] = await Promise.all([
          api.getDashboardStats(),
          // api.getRecentActivities(), // TODO: Backend'de yoksa mock
          // api.getTodoLists(), // TODO: Recent lists için
        ])
        
        console.log('✅ Dashboard stats loaded:', stats)
        
        const mockData: DashboardData = {
          stats: {
            ...stats,
            // Frontend computed fields
            totalLists: Math.ceil(stats.totalTasks / 4), // Estimate
            completedLists: Math.ceil(stats.completedToday / 2), // Estimate  
            totalItems: stats.totalTasks,
            completedItems: stats.completedToday,
            completionRate: stats.totalTasks > 0 ? Math.round((stats.completedToday / stats.totalTasks) * 100) : 0,
            activeStreakDays: 7, // Mock
            thisWeekCompleted: stats.completedToday,
            thisMonthCompleted: stats.completedToday * 7 // Estimate
          },
          activities: [
            {
              id: 1,
              type: 'item_completed',
              description: 'Completed "Buy groceries" in Shopping List',
              userId: user.id,
              user: user,
              targetType: 'item',
              targetId: 1,
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              type: 'list_created',
              description: 'Created new list "Weekend Plans"',
              userId: user.id,
              user: user,
              targetType: 'list',
              targetId: 2,
              createdAt: new Date(Date.now() - 3600000).toISOString()
            }
          ],
          recentLists: [
            {
              id: 1,
              title: 'Shopping List',
              description: 'Weekly grocery shopping',
              ownerId: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              colorCode: '#8B5CF6',
              createdBy: user,
              isShared: true,
              items: [],
              itemsCount: 8,
              completedItemsCount: 6,
              completionPercentage: 75,
              priority: 'medium',
              category: 'shopping'
            },
            {
              id: 2,
              title: 'Home Cleaning',
              description: 'Spring cleaning tasks',
              ownerId: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              colorCode: '#10B981',
              createdBy: user,
              isShared: false,
              items: [],
              itemsCount: 5,
              completedItemsCount: 2,
              completionPercentage: 40,
              priority: 'low',
              category: 'household'
            }
          ],
          partner: user.partner
        }
        
        setDashboardData(mockData)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, router, authLoading])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-md">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const stats = dashboardData?.stats
  const activities = dashboardData?.activities || []
  const recentLists = dashboardData?.recentLists || []
  const partner = dashboardData?.partner

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white/30 backdrop-blur-sm"
                style={{ backgroundColor: user.colorCode || '#8B5CF6' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user.username}! 👋
                </h1>
                <p className="text-purple-100">
                  Ready to plan together
                </p>
              </div>
            </div>
            
            {partner ? (
              <Link href="/partner">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: partner.colorCode || '#EC4899' }}
                    >
                      {partner.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Partner</p>
                      <p className="text-xs text-purple-100">{partner.username}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/profile">
                <Button 
                  variant="outline" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Connect Partner
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lists</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalLists}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ListIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedItems}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completionRate}%</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TargetIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeStreakDays}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShareIcon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Lists */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Lists</h2>
              <Link href="/todo-lists">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentLists.map((list) => (
                <Link key={list.id} href={`/todo-lists/${list.id}`}>
                  <div className="group mt-3 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-purple-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: list.colorCode }}
                        />
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {list.title}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">
                        {list.priority} priority
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                      {list.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-600">
                          {list.completedItemsCount}/{list.itemsCount} completed
                        </span>
                        {list.isShared && (
                          <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                            Shared
                          </span>
                        )}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${list.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/todo-lists/new">
              <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                <PlusIcon className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
                <p className="text-gray-600 group-hover:text-purple-600 font-medium transition-colors">
                  Create New List
                </p>
              </div>
            </Link>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Tasks</span>
                  <span className="font-semibold text-purple-600">{stats?.thisWeekCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Streak</span>
                  <span className="font-semibold text-orange-600">{stats?.activeStreakDays || 0} days</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium">{stats?.completionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.completionRate || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <TargetIcon className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {activities.length > 0 ? activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-6">
                <Link href="/todo-lists/new">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New List
                  </Button>
                </Link>
                <Link href="/partner">
                  <Button 
                    variant="outline"  
                    className="w-full mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Partner Overview
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 