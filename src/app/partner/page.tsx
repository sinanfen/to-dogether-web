'use client'

import { AppLayout } from '@/components/layout'
import { HeartIcon, UsersIcon, ListIcon, CheckIcon, TargetIcon, PlusIcon, ShareIcon } from '@/components/ui/icons'
import { Button, Input } from '@/components/ui'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { PartnerOverview, AcceptInviteRequest } from '@/types/api'

export default function PartnerOverviewPage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [partnerData, setPartnerData] = useState<PartnerOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [connectingPartner, setConnectingPartner] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const loadPartnerData = async () => {
      try {
        setLoading(true)
        console.log('👥 Partner data yükleniyor...')
        
        if (user.partner) {
          // Load full partner overview data
          const overview = await api.getPartnerOverview()
          console.log('✅ Partner overview loaded:', overview)
          
          // Map backend response to frontend interface
          const mappedData: PartnerOverview = {
            id: overview.id,
            username: overview.username,
            colorCode: overview.colorCode,
            createdAt: overview.createdAt,
            todoLists: overview.todoLists,
            // Create computed partner object for compatibility
            partner: {
              id: overview.id,
              username: overview.username,
              colorCode: overview.colorCode,
              createdAt: overview.createdAt,
              updatedAt: overview.createdAt, // Same as created for now
              isConnected: true,
              connectionDate: overview.createdAt
            },
            sharedLists: overview.todoLists || [],
            recentActivities: [], // Mock for now
            stats: {
              totalTasks: overview.todoLists?.reduce((total, list) => total + (list.items?.length || 0), 0) || 0,
              completedToday: 0, // Would need item status calculation
              pendingTasks: overview.todoLists?.reduce((total, list) => total + (list.items?.length || 0), 0) || 0,
              highPriorityTasks: overview.todoLists?.reduce((total, list) => 
                total + (list.items?.filter(item => item.severity === 2).length || 0), 0) || 0,
              myTasks: 0, // Would need user comparison
              partnerTasks: overview.todoLists?.reduce((total, list) => total + (list.items?.length || 0), 0) || 0,
              partnerUsername: overview.username
            }
          }
          
          setPartnerData(mappedData)
        } else {
          // No partner connected, create empty state
          setPartnerData(null)
        }
      } catch (err) {
        console.error('❌ Failed to load partner data:', err)
        // Don't set error if user just doesn't have a partner
        if (user.partner) {
          setError('Failed to load partner information')
        }
      } finally {
        setLoading(false)
      }
    }

    loadPartnerData()
  }, [user, router])

  const handleConnectPartner = async () => {
    if (!inviteCode.trim()) return

    try {
      setConnectingPartner(true)
      setError(null)

      const connectData: AcceptInviteRequest = {
        inviteToken: inviteCode.trim()
      }

      await api.acceptPartnerInvite(connectData)
      await refreshUser() // Refresh user data to get partner info
      
      // Reload the page to get fresh partner data
      window.location.reload()
    } catch (err) {
      setError('Failed to connect with partner. Please check the invite code.')
      console.error('Partner connection error:', err)
    } finally {
      setConnectingPartner(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

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
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
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

  // No partner connected
  if (!user.partner) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect with Your Partner</h1>
            <p className="text-gray-600 text-lg">
              Start planning together by connecting with your partner using their invite code.
            </p>
          </div>

          {/* Connect Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                             Enter Partner&apos;s Invite Code
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code..."
                className="w-full text-center font-mono text-lg"
                disabled={connectingPartner}
              />
              
              <Button
                onClick={handleConnectPartner}
                disabled={!inviteCode.trim() || connectingPartner}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                size="lg"
              >
                {connectingPartner ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Connect with Partner
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Don&apos;t have an invite code?</p>
              <Link href="/profile">
                <Button variant="outline" className="bg-gray-50 hover:bg-gray-100">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Generate Your Invite Code
                </Button>
              </Link>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <ListIcon className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Shared Todo Lists</h3>
              <p className="text-gray-600 text-sm">Create and manage todo lists together with your partner.</p>
            </div>
            
            <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
              <TargetIcon className="h-8 w-8 text-pink-600 mb-4" />
                             <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
               <p className="text-gray-600 text-sm">Monitor each other&apos;s progress and celebrate achievements together.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Partner connected - show overview
  if (!partnerData) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error || 'Failed to load partner data'}</p>
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

  const stats = partnerData.stats
  const recentLists = partnerData.sharedLists || []
  const activities = partnerData.recentActivities || []

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Partner Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30 backdrop-blur-sm"
                style={{ backgroundColor: partnerData.colorCode || '#EC4899' }}
              >
                {partnerData.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{partnerData.username}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <HeartIcon className="h-4 w-4" />
                  <span className="text-purple-100">Your Planning Partner</span>
                </div>
                {partnerData.partner?.connectionDate && (
                  <p className="text-purple-100 text-sm mt-1">
                    Connected since {new Date(partnerData.partner.connectionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <Link href="/todo-lists">
              <Button 
                variant="outline" 
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Shared List
              </Button>
            </Link>
          </div>
        </div>

        {/* Partner Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                                 <p className="text-sm font-medium text-gray-600">Partner&apos;s Lists</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalLists || 0}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <ListIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared Lists</p>
                <p className="text-2xl font-bold text-blue-600">{partnerData.collaborationStats?.sharedListsCount || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedItems || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.completionRate || 0}%</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TargetIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shared Lists */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Shared Lists</h2>
              <Link href="/todo-lists">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentLists.length > 0 ? recentLists.map((list) => (
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
                        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                          Shared
                        </span>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getProgressColor(list.completionPercentage || 0)} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${list.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No shared lists yet</p>
                  <Link href="/todo-lists/new">
                    <Button variant="outline">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Shared List
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Partner Activity */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
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

            {/* Collaboration Stats */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Collaboration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Shared Lists</span>
                  <span className="font-semibold">{partnerData.collaborationStats?.sharedListsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Joint Tasks</span>
                  <span className="font-semibold">{partnerData.collaborationStats?.collaborativeItemsCount || 0}</span>
                </div>
                {partnerData.collaborationStats?.lastCollaboration && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs text-purple-100">
                      Last worked together: {new Date(partnerData.collaborationStats.lastCollaboration).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 