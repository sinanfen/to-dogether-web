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
  PlusIcon,
  ShareIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { DashboardStats, TodoList, Partner } from '@/types/api'
import { RecentActivities } from '@/components/recent-activities'

interface DashboardData {
  stats: DashboardStats
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
      router.push('/auth/login')
      return
    }
    

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Real API calls
        const [stats, myLists, partnerLists] = await Promise.all([
          api.getDashboardStats(),
          api.getTodoLists(),
          api.getPartnerTodoLists().catch(() => []), // Partner yoksa empty array
        ])
        
        // Combine all lists and sort by updated date (most recent first)
        const allLists = [...myLists, ...partnerLists]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5) // Show only 5 most recent
        
        // Enhance lists with computed fields and real item counts
        const enhancedLists = await Promise.all(
          allLists.map(async (list) => {
            try {
              // Get real item counts for each list
              const items = await api.getTodoItems(list.id)
              const completedItems = items.filter(item => item.status === 1).length
              const totalItems = items.length
              const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
              
              return {
                ...list,
                colorCode: list.colorCode,
                isShared: list.isShared,
                itemsCount: totalItems,
                completedItemsCount: completedItems,
                completionPercentage: completionPercentage,
                priority: 'medium' as const,
                category: 'general'
              }
            } catch (error) {
              console.error(`Failed to fetch items for list ${list.id}:`, error)
              // Fallback to basic list info if items fetch fails
              return {
                ...list,
                colorCode: list.colorCode,
                isShared: list.isShared,
                itemsCount: 0,
                completedItemsCount: 0,
                completionPercentage: 0,
                priority: 'medium' as const,
                category: 'general'
              }
            }
          })
        )
        
        const dashboardData: DashboardData = {
          stats: {
            ...stats,
            // Frontend computed fields
            totalLists: myLists.length + partnerLists.length,
            completedLists: Math.ceil(stats.completedToday / 2), // Estimate  
            totalItems: stats.totalTasks,
            completedItems: stats.completedToday,
            completionRate: stats.totalTasks > 0 ? Math.round((stats.completedToday / stats.totalTasks) * 100) : 0,
            activeStreakDays: 7, // Mock for now
            thisWeekCompleted: stats.completedToday,
            thisMonthCompleted: stats.completedToday * 7 // Estimate
          },
          recentLists: enhancedLists,
          partner: user.partner
        }
        
        setDashboardData(dashboardData)
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
          <p className="text-gray-600">Yükleniyor...</p>
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
              Tekrar Dene
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const stats = dashboardData?.stats
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
                  Tekrar hoş geldin, {user.username}! 👋
                </h1>
                <p className="text-purple-100">
                  Birlikte planlamaya hazır mısın?
                </p>
              </div>
            </div>
            
            {partner && (
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
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Liste</p>
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
                  <p className="text-sm font-medium text-gray-600">Tamamlandı</p>
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
                  <p className="text-sm font-medium text-gray-600">Tamamlama Oranı</p>
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
              <h2 className="text-xl font-bold text-gray-900">Son Listeler</h2>
              <Link href="/todo-lists">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:shadow-lg transition-all duration-300 group"
                >
                  <span className="mr-1">Tümünü Görüntüle</span>
                  <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
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
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                      {list.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-600">
                          {list.completedItemsCount}/{list.itemsCount} tamamlandı
                        </span>
                        {list.isShared && (
                          <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                            Paylaşıldı
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
                  Yeni Liste Oluştur
                </p>
              </div>
            </Link>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Hafta</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tamamlanan Görevler</span>
                  <span className="font-semibold text-purple-600">{stats?.thisWeekCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aktif Streak</span>
                  <span className="font-semibold text-orange-600">{stats?.activeStreakDays || 0} gün</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Genel Tamamlama Oranı</span>
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

            {/* Recent Activities */}
            <RecentActivities limit={5} />

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Hızlı Eylemler</h3>
              <div className="space-y-6">
                <Link href="/todo-lists/new">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Yeni Liste
                  </Button>
                </Link>
                <Link href="/partner">
                  <Button 
                    variant="outline"  
                    className="w-full mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Partner Özeti
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