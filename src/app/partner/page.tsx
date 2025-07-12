'use client'

import { AppLayout } from '@/components/layout'
import { HeartIcon, UsersIcon, ListIcon, CheckIcon, TargetIcon, PlusIcon, ClipboardIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import type { PartnerOverview, Activity } from '@/types/api'

export default function PartnerOverviewPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [partnerData, setPartnerData] = useState<PartnerOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [inviteTokenLoading, setInviteTokenLoading] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  useEffect(() => {
    // Only redirect to login if user is not authenticated and auth loading is complete
    if (!user && !authLoading) {
      router.push('/auth/login')
      return
    }

    // Don't load data if user is not authenticated yet
    if (!user) {
      return
    }

    const loadPartnerData = async () => {
      try {
        setLoading(true)
        
        // Eğer partner yoksa invite token'ı al
        if (!user.partner) {
          setInviteTokenLoading(true)
          try {
            const response = await api.getCoupleInviteToken()
            setInviteToken(response.inviteToken)
          } catch (err) {
            console.error('Failed to get invite token:', err)
            setError('Failed to get invite token')
          } finally {
            setInviteTokenLoading(false)
          }
        }
        
        if (user.partner) {
          // Load full partner overview data
          const overview = await api.getPartnerOverview()
          // Calculate real collaboration stats
          const sharedLists = overview.todoLists?.filter(list => list.isShared) || []
          const totalItems = overview.todoLists?.reduce((total, list) => total + (list.items?.length || 0), 0) || 0
          const completedItems = overview.todoLists?.reduce((total, list) => 
            total + (list.items?.filter(item => item.status === 1).length || 0), 0) || 0
          const highPriorityItems = overview.todoLists?.reduce((total, list) => 
            total + (list.items?.filter(item => item.severity === 2).length || 0), 0) || 0
          
          // Get recent activities for partner
          let recentActivities: Activity[] = []
          try {
            const activitiesResponse = await api.getRecentActivities(10)
            recentActivities = activitiesResponse.activities.filter(activity => 
              activity.userId === overview.id
            )
          } catch (error) {
            console.log('Could not load partner activities:', error)
          }

          // Map backend response to frontend interface
          const mappedData: PartnerOverview = {
            id: overview.id,
            username: overview.username,
            colorCode: overview.colorCode,
            createdAt: overview.createdAt,
            todoLists: overview.todoLists.map(list => ({
              ...list,
              colorCode: list.colorCode
            })),
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
            sharedLists: sharedLists,
            recentActivities: recentActivities,
            stats: {
              totalTasks: totalItems,
              completedToday: completedItems,
              pendingTasks: totalItems - completedItems,
              highPriorityTasks: highPriorityItems,
              myTasks: 0, // Would need user comparison
              partnerTasks: totalItems,
              partnerUsername: overview.username,
              // Frontend computed fields
              totalLists: overview.todoLists?.length || 0,
              completedLists: sharedLists.filter(list => 
                (list.items?.filter(item => item.status === 1).length || 0) === (list.items?.length || 0)
              ).length,
              totalItems: totalItems,
              completedItems: completedItems,
              completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
            },
            collaborationStats: {
              sharedListsCount: sharedLists.length,
              collaborativeItemsCount: sharedLists.reduce((total, list) => 
                total + (list.items?.length || 0), 0),
              lastCollaboration: sharedLists.length > 0 ? 
                sharedLists.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt :
                overview.createdAt
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
  }, [user?.id, user?.partner, router, authLoading])

  const copyInviteToken = async () => {
    if (inviteToken) {
      try {
        await navigator.clipboard.writeText(inviteToken)
        setTokenCopied(true)
        setTimeout(() => setTokenCopied(false), 2000)
    } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null // Will be redirected by useEffect
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse -mt-4">
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
        <div className="max-w-2xl mx-auto space-y-6 -mt-4">
          {/* Header */}
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invite Your Partner</h1>
            <p className="text-gray-600 text-lg">
              You need to invite your partner to start planning together. Share your invite code with them!
            </p>
          </div>

          {/* Invite Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Your Invite Code
            </h2>

            {inviteTokenLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">Loading invite code...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : inviteToken ? (
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                  <p className="text-sm text-purple-700 mb-3 font-medium text-center">
                    Share this code with your partner:
                  </p>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-purple-300 text-purple-800 font-mono text-lg text-center break-all">
                      {inviteToken}
                    </code>
              <Button
                      onClick={copyInviteToken}
                      variant="outline"
                      className="flex-shrink-0 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
              >
                      <ClipboardIcon className="h-4 w-4 mr-1 text-current" />
                      {tokenCopied ? 'Copied!' : 'Copy'}
              </Button>
                  </div>
            </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📱 How to share:</h3>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Copy the code above</li>
                    <li>2. Send it to your partner</li>
                                         <li>3. They&apos;ll use it during registration</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Unable to load invite code</p>
            </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Getting Started</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <p>Share your invite code with your partner</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                                 <p>They&apos;ll register using your code</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <p>Start planning together!</p>
            </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Partner connected - show overview
  return (
    <AppLayout>
      <div className="space-y-4 -mt-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
              <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30"
              style={{ backgroundColor: partnerData?.colorCode || '#EC4899' }}
              >
              {partnerData?.username?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
              <h1 className="text-3xl font-bold mb-2">{partnerData?.username || 'Partner'}</h1>
              <p className="text-white/80 text-lg">
                Connected since {partnerData?.createdAt ? new Date(partnerData.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900">{partnerData?.stats?.totalLists || 0}</p>
              </div>
              <ListIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{partnerData?.stats?.totalItems || 0}</p>
              </div>
              <CheckIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{partnerData?.stats?.completedItems || 0}</p>
              </div>
              <TargetIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{partnerData?.stats?.completionRate || 0}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Overview</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Overall Completion</span>
              <span className="text-gray-900 font-semibold">{partnerData?.stats?.completionRate || 0}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(partnerData?.stats?.completionRate || 0)} transition-all duration-500`}
                style={{ width: `${partnerData?.stats?.completionRate || 0}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Completed Tasks</p>
                <p className="text-lg font-semibold text-green-600">{partnerData?.stats?.completedItems || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Pending Tasks</p>
                <p className="text-lg font-semibold text-orange-600">{partnerData?.stats?.pendingTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Todo Lists */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Todo Lists</h2>
              <Link href="/todo-lists">
              <Button variant="outline" size="sm">
                View All Lists
                </Button>
              </Link>
            </div>

          {partnerData?.todoLists && partnerData.todoLists.length > 0 ? (
            <div className="space-y-4">
              {partnerData.todoLists.slice(0, 3).map((list) => (
                <div key={list.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: list.colorCode || '#8B5CF6' }}
                        />
                      <div>
                        <h3 className="font-medium text-gray-900">{list.title}</h3>
                        <p className="text-sm text-gray-600">
                          {list.items?.length || 0} items • Updated {new Date(list.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link href={`/todo-lists/${list.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
                <div className="text-center py-8">
              <ListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No todo lists yet</p>
                  <Link href="/todo-lists/new">
                <Button className="mt-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First List
                    </Button>
                  </Link>
                </div>
              )}
          </div>

        {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
              
          {partnerData?.recentActivities && partnerData.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {partnerData.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: partnerData.colorCode || '#EC4899' }}
                  >
                    {partnerData.username?.charAt(0).toUpperCase() || 'P'}
                  </div>
                                     <div className="flex-1">
                     <p className="text-sm text-gray-900">{activity.message}</p>
                     <p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleDateString()}</p>
            </div>
                </div>
              ))}
                </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 