'use client'

import { AppLayout } from '@/components/layout'
import { ListIcon, PlusIcon, EditIcon, TrashIcon, UsersIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { useState } from 'react'

export default function TodoListsPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'partner'>('my')

  // Mock data - gerçek API call'lardan gelecek
  const myLists = [
    { 
      id: 1, 
      title: 'Weekend Plans', 
      description: 'Things to do this weekend',
      tasksCount: 5, 
      completedCount: 2,
      createdAt: '2024-01-15',
      color: '#8B5CF6'
    },
    { 
      id: 2, 
      title: 'Grocery Shopping', 
      description: 'Weekly grocery list',
      tasksCount: 8, 
      completedCount: 6,
      createdAt: '2024-01-14',
      color: '#EC4899'
    },
    { 
      id: 3, 
      title: 'Home Cleaning', 
      description: 'Spring cleaning tasks',
      tasksCount: 4, 
      completedCount: 1,
      createdAt: '2024-01-13',
      color: '#10B981'
    }
  ]

  const partnerLists = [
    { 
      id: 4, 
      title: 'Work Projects', 
      description: 'Partner work related tasks',
      tasksCount: 6, 
      completedCount: 3,
      createdAt: '2024-01-12',
      color: '#F59E0B'
    },
    { 
      id: 5, 
      title: 'Gift Ideas', 
      description: 'Birthday and anniversary gifts',
      tasksCount: 3, 
      completedCount: 1,
      createdAt: '2024-01-10',
      color: '#EF4444'
    }
  ]

  const currentLists = activeTab === 'my' ? myLists : partnerLists

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
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
            >
              <UsersIcon className="h-4 w-4" />
              <span>Partner Lists ({partnerLists.length})</span>
            </button>
          </div>

          {/* Lists Grid */}
          {currentLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLists.map((list) => {
                const progressPercentage = Math.round((list.completedCount / list.tasksCount) * 100)
                
                return (
                  <div
                    key={list.id}
                    className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* List Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: list.color }}
                        />
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {list.title}
                        </h3>
                      </div>
                      
                      {activeTab === 'my' && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <EditIcon className="h-4 w-4 text-gray-600 hover:text-purple-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <TrashIcon className="h-4 w-4 text-gray-600 hover:text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {list.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          {list.completedCount} of {list.tasksCount} completed
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getProgressColor(progressPercentage)} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Created {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                      
                      <Link href={`/todo-lists/${list.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'my' ? (
                  <ListIcon className="h-8 w-8 text-gray-400" />
                ) : (
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'my' ? 'No lists yet' : 'No partner lists'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeTab === 'my' 
                  ? 'Create your first todo list to start organizing your tasks'
                  : 'Your partner hasn&apos;t created any lists yet'
                }
              </p>
              {activeTab === 'my' && (
                <Link href="/todo-lists/new">
                  <Button variant="gradient">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First List
                  </Button>
                </Link>
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
                {myLists.reduce((acc, list) => acc + list.completedCount, 0) + 
                 partnerLists.reduce((acc, list) => acc + list.completedCount, 0)}
              </p>
              <p className="text-gray-600 font-medium">Completed Tasks</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {myLists.reduce((acc, list) => acc + (list.tasksCount - list.completedCount), 0) + 
                 partnerLists.reduce((acc, list) => acc + (list.tasksCount - list.completedCount), 0)}
              </p>
              <p className="text-gray-600 font-medium">Pending Tasks</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 