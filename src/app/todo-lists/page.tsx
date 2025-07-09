'use client'

import { AppLayout } from '@/components/layout'
import { ListIcon, PlusIcon, EditIcon, TrashIcon, UsersIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { TodoList } from '@/types/api'

export default function TodoListsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'my' | 'partner'>('my')
  const [myLists, setMyLists] = useState<TodoList[]>([])
  const [partnerLists, setPartnerLists] = useState<TodoList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingListId, setDeletingListId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    loadTodoLists()
  }, [user, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodoLists = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📝 Todo lists yükleniyor...')

      // Load user's own lists
      const userLists = await api.getTodoLists()
      console.log('✅ My lists loaded:', userLists)
      
      // Add frontend computed fields
      const enhancedUserLists = userLists.map(list => ({
        ...list,
        colorCode: '#8B5CF6', // Default purple
        itemsCount: list.items?.length || 0,
        completedItemsCount: list.items?.filter(item => item.status === 1).length || 0,
        completionPercentage: list.items?.length ? 
          Math.round((list.items.filter(item => item.status === 1).length / list.items.length) * 100) : 0,
        priority: 'medium' as const
      }))
      
      setMyLists(enhancedUserLists)

      // Load partner's lists if partner exists
      if (user?.partner) {
        try {
          const partnerTodoLists = await api.getPartnerTodoLists()
          console.log('✅ Partner lists loaded:', partnerTodoLists)
          
          // Add frontend computed fields
          const enhancedPartnerLists = partnerTodoLists.map(list => ({
            ...list,
            colorCode: '#EC4899', // Default pink for partner
            itemsCount: list.items?.length || 0,
            completedItemsCount: list.items?.filter(item => item.status === 1).length || 0,
            completionPercentage: list.items?.length ? 
              Math.round((list.items.filter(item => item.status === 1).length / list.items.length) * 100) : 0,
            priority: 'medium' as const
          }))
          
          setPartnerLists(enhancedPartnerLists)
        } catch (partnerError) {
          console.error('❌ Failed to load partner lists:', partnerError)
          // Don't throw error for partner lists, just log it
          setPartnerLists([])
        }
      } else {
        console.log('👤 No partner, skipping partner lists')
        setPartnerLists([])
      }
    } catch (err) {
      console.error('❌ Todo lists loading error:', err)
      setError('Failed to load todo lists')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteList = async (listId: number) => {
    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingListId(listId)
      await api.deleteTodoList(listId)
      
      // Refresh the lists
      await loadTodoLists()
    } catch (err) {
      setError('Failed to delete todo list')
      console.error('Delete list error:', err)
    } finally {
      setDeletingListId(null)
    }
  }

  const currentLists = activeTab === 'my' ? myLists : partnerLists

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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Todo Lists</h1>
            <p className="text-gray-600 mt-2">
              Organize your tasks and collaborate with your partner
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <Link href="/todo-lists/new">
              <Button variant="gradient" size="lg" className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Create New List</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              onClick={() => {
                setError(null)
                loadTodoLists()
              }}
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === 'my'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListIcon className="h-4 w-4" />
              <span>My Lists ({myLists.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                activeTab === 'partner'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={!user.partner}
            >
              <UsersIcon className="h-4 w-4" />
              <span>
                {user.partner ? `Partner Lists (${partnerLists.length})` : 'No Partner'}
              </span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl p-6 h-48"></div>
              ))}
            </div>
          )}

          {/* Lists Grid */}
          {!loading && currentLists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLists.map((list) => {
                const isDeleting = deletingListId === list.id
                
                return (
                  <div
                    key={list.id}
                    className={`group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      isDeleting ? 'opacity-50' : ''
                    }`}
                  >
                    {/* List Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: list.colorCode }}
                        />
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {list.title}
                        </h3>
                      </div>
                      
                      {activeTab === 'my' && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/todo-lists/${list.id}/edit`}>
                            <button 
                              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                              disabled={isDeleting}
                            >
                              <EditIcon className="h-4 w-4 text-gray-600 hover:text-purple-600" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDeleteList(list.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <TrashIcon className="h-4 w-4 text-gray-600 hover:text-red-600" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {list.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {list.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          {list.completedItemsCount || 0} of {list.itemsCount || 0} completed
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          {list.completionPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getProgressColor(list.completionPercentage || 0)} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${list.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                          {list.priority}
                        </span>
                        {list.isShared && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                            Shared
                          </span>
                        )}
                        {list.category && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                            {list.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <p>Created {new Date(list.createdAt).toLocaleDateString()}</p>
                        {list.lastActivity && (
                          <p>Last activity {new Date(list.lastActivity).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <Link href={`/todo-lists/${list.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isDeleting}
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && currentLists.length === 0 && (
            <div className="text-center py-16">
              {activeTab === 'my' ? (
                <>
                  <ListIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    No Todo Lists Yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Create your first todo list to start organizing your tasks and planning with your partner.
                  </p>
                  <Link href="/todo-lists/new">
                    <Button variant="gradient" size="lg">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Your First List
                    </Button>
                  </Link>
                </>
              ) : user.partner ? (
                <>
                  <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    No Partner Lists Yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your partner hasn&apos;t created any todo lists yet, or they haven&apos;t shared any lists with you.
                  </p>
                  <Link href="/partner">
                    <Button variant="outline">
                      View Partner Overview
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Connect with Your Partner
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Connect with your partner to see their todo lists and collaborate on shared tasks.
                  </p>
                  <Link href="/profile">
                    <Button variant="gradient">
                      Connect Partner
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {myLists.length + partnerLists.length}
              </p>
              <p className="text-gray-600 font-medium">Total Lists</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {myLists.reduce((acc, list) => acc + (list.completedItemsCount || 0), 0) + 
                 partnerLists.reduce((acc, list) => acc + (list.completedItemsCount || 0), 0)}
              </p>
              <p className="text-gray-600 font-medium">Completed Tasks</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {myLists.reduce((acc, list) => acc + ((list.itemsCount || 0) - (list.completedItemsCount || 0)), 0) + 
                 partnerLists.reduce((acc, list) => acc + ((list.itemsCount || 0) - (list.completedItemsCount || 0)), 0)}
              </p>
              <p className="text-gray-600 font-medium">Pending Tasks</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 