'use client'

import { AppLayout } from '@/components/layout'
import { HeartIcon, UsersIcon, ListIcon, CheckIcon, TargetIcon, UserIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui'
import { usePartnerOverview, usePartnerTodoLists } from '@/hooks/api'
import { TodoItemStatus } from '@/types/api'
import Link from 'next/link'

// Skeleton Components
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

function ListCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mb-3"></div>
      <div className="h-2 w-full bg-gray-200 rounded mb-3"></div>
    </div>
  )
}

export default function PartnerOverviewPage() {
  const { data: partnerOverview, isLoading: partnerLoading, error: partnerError } = usePartnerOverview()
  const { data: partnerTodoLists, isLoading: listsLoading, error: listsError } = usePartnerTodoLists()

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  // Loading state
  if (partnerLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="text-center animate-pulse">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="text-left">
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                <ListCardSkeleton />
                <ListCardSkeleton />
                <ListCardSkeleton />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (partnerError) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="text-center py-12">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Partner Connected</h2>
            <p className="text-gray-600 mb-6">
               You haven&apos;t connected with a partner yet. Share your invite code to connect!
             </p>
            <Link href="/profile">
              <Button variant="gradient">View Profile & Invite Code</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  // No partner data
  if (!partnerOverview) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="text-center py-12">
            <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Partner Information</h2>
             <p className="text-gray-600">Please wait while we load your partner&apos;s information...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ backgroundColor: partnerOverview.colorCode }}
            >
              {partnerOverview.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">{partnerOverview.username}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">
                  Partner ID: {partnerOverview.id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <HeartIcon className="h-5 w-5" />
            <span className="font-medium">Your Planning Partner</span>
            <HeartIcon className="h-5 w-5" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partner&apos;s Lists</p>
                <p className="text-3xl font-bold text-purple-600">{partnerOverview.todoLists.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <ListIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Detailed Lists</p>
                <p className="text-3xl font-bold text-blue-600">{partnerTodoLists?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <TargetIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partner Connected</p>
                <p className="text-2xl font-bold text-green-600">Yes</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partner Lists from Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {partnerOverview.username}&apos;s Lists Overview
                </h2>
                <span className="text-sm text-gray-600">
                  {partnerOverview.todoLists.length} lists from overview
                </span>
              </div>
              
              {partnerOverview.todoLists.length > 0 ? (
                <div className="space-y-4 mb-8">
                  {partnerOverview.todoLists.map((list) => (
                    <div key={list.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full bg-purple-500" />
                          <h3 className="font-semibold text-gray-900">{list.title}</h3>
                        </div>
                        <Link href={`/todo-lists/${list.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                      
                      {list.description && (
                        <p className="text-sm text-gray-600">{list.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-8">
                  <ListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No lists in overview</p>
                  <p className="text-xs text-gray-400">
                    Your partner&apos;s lists are not visible in the overview
                  </p>
                </div>
              )}

              {/* Detailed Lists Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detailed Partner Lists
                </h3>
                
                {listsLoading ? (
                  <div className="space-y-4">
                    <ListCardSkeleton />
                    <ListCardSkeleton />
                    <ListCardSkeleton />
                  </div>
                ) : listsError ? (
                  <div className="text-center py-8">
                    <ListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Failed to load partner&apos;s lists</p>
                  </div>
                ) : partnerTodoLists && partnerTodoLists.length > 0 ? (
                  <div className="space-y-4">
                    {partnerTodoLists.map((list) => {
                      const completedCount = list.items?.filter(item => item.status === TodoItemStatus.Done).length || 0
                      const totalCount = list.items?.length || 0
                      const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                      
                      return (
                        <div key={list.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 rounded-full bg-blue-500" />
                              <h3 className="font-semibold text-gray-900">{list.title}</h3>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(list.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {list.description && (
                            <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              {completedCount} of {totalCount} completed
                            </span>
                            <span className="text-xs font-medium text-gray-900">
                              {progressPercentage}%
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className={`bg-gradient-to-r ${getProgressColor(progressPercentage)} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Link href={`/todo-lists/${list.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No detailed lists found</p>
                    <p className="text-xs text-gray-400">
                      Your partner hasn&apos;t created any detailed todo lists yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partner Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Username</span>
                  <span className="font-semibold text-gray-900">{partnerOverview.username}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Partner ID</span>
                  <span className="font-semibold text-gray-900">{partnerOverview.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Color Theme</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: partnerOverview.colorCode }}
                    />
                    <span className="text-sm font-medium text-gray-900">{partnerOverview.colorCode}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overview Lists</span>
                  <span className="font-semibold text-purple-600">{partnerOverview.todoLists.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Detailed Lists</span>
                  <span className="font-semibold text-blue-600">{partnerTodoLists?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link href="/todo-lists">
                  <Button variant="outline" className="w-full justify-start">
                    <ListIcon className="h-4 w-4 mr-2" />
                    View All Lists
                  </Button>
                </Link>
                
                <Link href="/todo-lists/new">
                  <Button variant="gradient" className="w-full justify-start">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Create Shared List
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <TargetIcon className="h-4 w-4 mr-2" />
                    Back to Dashboard
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