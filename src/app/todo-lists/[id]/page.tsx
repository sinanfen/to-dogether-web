'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { 
  PlusIcon, 
  CheckIcon, 
  EditIcon, 
  TrashIcon, 
  UserIcon, 
  ListIcon,
  ShareIcon,
  TargetIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { api } from '@/lib/api'
import type { TodoList, TodoItem, CreateTodoItemRequest, UpdateTodoItemRequest } from '@/types/api'

export default function TodoListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const listId = parseInt(params.id as string)

  const [todoList, setTodoList] = useState<TodoList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingItem, setAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)
  
  // Form states
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: null as number | null,
    dueDate: ''
  })
  
  const [editItemForm, setEditItemForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: null as number | null,
    dueDate: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!listId || isNaN(listId)) {
      router.push('/todo-lists')
      return
    }

    loadTodoList()
  }, [user, router, listId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodoList = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`📝 Todo list ${listId} yükleniyor...`)
      
      // Get list details and items separately
      const [list, items] = await Promise.all([
        api.getTodoList(listId),
        api.getTodoItems(listId)
      ])
      
      console.log('✅ Todo list loaded:', list)
      console.log('✅ Todo items loaded:', items)
      
      // Map backend items to frontend format
      const enhancedItems = items.map(item => ({
        ...item,
        // Map backend fields to frontend
        isCompleted: item.status === 1,
        priority: (item.severity === 2 ? 'high' : item.severity === 1 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        todoListId: listId
      }))
      
      // Enhance list with items and computed fields
      const enhancedList = {
        ...list,
        items: enhancedItems,
        colorCode: '#8B5CF6', // Default color
        itemsCount: enhancedItems.length,
        completedItemsCount: enhancedItems.filter(item => item.isCompleted).length,
        completionPercentage: enhancedItems.length ? 
          Math.round((enhancedItems.filter(item => item.isCompleted).length / enhancedItems.length) * 100) : 0,
        priority: 'medium' as const
      }
      
      setTodoList(enhancedList)
    } catch (err) {
      console.error('❌ Todo list loading error:', err)
      setError('Failed to load todo list')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItemForm.title.trim()) return

    try {
      setAddingItem(true)
      
      const itemData: CreateTodoItemRequest = {
        title: newItemForm.title.trim(),
        description: newItemForm.description.trim() || undefined,
        priority: newItemForm.priority,
        assignedTo: newItemForm.assignedTo || undefined,
        dueDate: newItemForm.dueDate || undefined
      }

      await api.createTodoItem(listId, itemData)
      
      // Reset form
      setNewItemForm({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: null,
        dueDate: ''
      })
      
      // Reload list
      await loadTodoList()
    } catch (err) {
      setError('Failed to add item')
      console.error('Add item error:', err)
    } finally {
      setAddingItem(false)
    }
  }

  const handleEditItem = async (itemId: number) => {
    if (!editItemForm.title.trim()) return

    try {
      const itemData: UpdateTodoItemRequest = {
        id: itemId,
        title: editItemForm.title.trim(),
        description: editItemForm.description.trim() || undefined,
        priority: editItemForm.priority,
        assignedTo: editItemForm.assignedTo || undefined,
        dueDate: editItemForm.dueDate || undefined
      }

      await api.updateTodoItem(listId, itemData)
      setEditingItemId(null)
      
      // Reload list
      await loadTodoList()
    } catch (err) {
      setError('Failed to update item')
      console.error('Edit item error:', err)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      setDeletingItemId(itemId)
      await api.deleteTodoItem(listId, itemId)
      
      // Reload list
      await loadTodoList()
    } catch (err) {
      setError('Failed to delete item')
      console.error('Delete item error:', err)
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleToggleComplete = async (itemId: number) => {
    try {
      await api.toggleTodoItem(listId, itemId)
      
      // Reload list
      await loadTodoList()
    } catch (err) {
      setError('Failed to toggle item')
      console.error('Toggle item error:', err)
    }
  }

  const startEditItem = (item: TodoItem) => {
    setEditingItemId(item.id)
    setEditItemForm({
      title: item.title,
      description: item.description || '',
      priority: item.priority || 'medium',
      assignedTo: item.assignedTo || null,
      dueDate: item.dueDate || ''
    })
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditItemForm({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: null,
      dueDate: ''
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
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
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
          
          {/* Items Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-md">
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error && !todoList) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
            <div className="mt-4 space-x-3">
              <Button 
                onClick={() => {
                  setError(null)
                  loadTodoList()
                }}
                variant="outline"
              >
                Retry
              </Button>
              <Link href="/todo-lists">
                <Button variant="gradient">
                  Back to Lists
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!todoList) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <ListIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">List Not Found</h2>
          <p className="text-gray-600 mb-6">The todo list you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/todo-lists">
            <Button variant="gradient">
              Back to Lists
            </Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const items = todoList.items || []
  const completedItems = items.filter(item => item.isCompleted)
  const pendingItems = items.filter(item => !item.isCompleted)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/todo-lists">
                  <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    ← Back
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div 
                  className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white/30"
                  style={{ backgroundColor: todoList.colorCode }}
                />
                <h1 className="text-2xl font-bold">{todoList.title}</h1>
              </div>
              {todoList.description && (
                <p className="text-purple-100">{todoList.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-purple-100">Progress</p>
                <p className="text-xl font-bold">{todoList.completionPercentage}%</p>
              </div>
              <div className="w-16 bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-300"
                  style={{ width: `${todoList.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* List Meta */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <TargetIcon className="h-4 w-4" />
              <span className="text-sm capitalize">{todoList.priority} Priority</span>
            </div>
            {todoList.isShared && (
              <div className="flex items-center space-x-2">
                <ShareIcon className="h-4 w-4" />
                <span className="text-sm">Shared List</span>
              </div>
            )}
            {todoList.category && (
              <div className="flex items-center space-x-2">
                <ListIcon className="h-4 w-4" />
                <span className="text-sm capitalize">{todoList.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              onClick={() => setError(null)}
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{items.length}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedItems.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingItems.length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{todoList.completionPercentage}%</p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
          </div>
        </div>

        {/* Add New Item */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Item</h2>
          
          <div className="space-y-4">
            <Input
              value={newItemForm.title}
              onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
              placeholder="Enter item title..."
              className="w-full"
              disabled={addingItem}
            />
            
            <Input
              value={newItemForm.description}
              onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
              placeholder="Description (optional)..."
              className="w-full"
              disabled={addingItem}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newItemForm.priority}
                  onChange={(e) => setNewItemForm({ ...newItemForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={addingItem}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={newItemForm.assignedTo || ''}
                  onChange={(e) => setNewItemForm({ ...newItemForm, assignedTo: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={addingItem}
                >
                  <option value="">Unassigned</option>
                  <option value={user.id}>Me ({user.username})</option>
                  {user.partner && (
                    <option value={user.partner.id}>{user.partner.username}</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newItemForm.dueDate}
                  onChange={(e) => setNewItemForm({ ...newItemForm, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={addingItem}
                />
              </div>
            </div>
            
            <Button
              onClick={handleAddItem}
              disabled={!newItemForm.title.trim() || addingItem}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {addingItem ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Todo Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Todo Items ({items.length})
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ListIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Yet</h3>
              <p className="text-gray-600">Add your first item to get started with this todo list.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Items */}
              {pendingItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Pending ({pendingItems.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 ${
                          deletingItemId === item.id ? 'opacity-50' : ''
                        }`}
                      >
                        {editingItemId === item.id ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <Input
                              value={editItemForm.title}
                              onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                              placeholder="Item title..."
                              className="w-full"
                            />
                            <Input
                              value={editItemForm.description}
                              onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })}
                              placeholder="Description..."
                              className="w-full"
                            />
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleEditItem(item.id)}
                                size="sm"
                                disabled={!editItemForm.title.trim()}
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => handleToggleComplete(item.id)}
                              className="w-5 h-5 rounded border-2 border-gray-300 hover:border-purple-500 flex items-center justify-center transition-colors mt-0.5 flex-shrink-0"
                              disabled={deletingItemId === item.id}
                            >
                              {item.isCompleted && (
                                <CheckIcon className="h-3 w-3 text-purple-600" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className={`text-sm mt-1 ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                      {item.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center space-x-3 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority || 'medium')}`}>
                                      {getPriorityIcon(item.priority || 'medium')} {item.priority || 'medium'}
                                    </span>
                                    
                                    {item.assignedUser && (
                                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                                        <UserIcon className="h-3 w-3" />
                                        <span>{item.assignedUser.username}</span>
                                      </div>
                                    )}
                                    
                                    {item.dueDate && (
                                      <div className="text-xs text-gray-600">
                                        Due: {new Date(item.dueDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={() => startEditItem(item)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={deletingItemId === item.id}
                                  >
                                    <EditIcon className="h-4 w-4 text-gray-600 hover:text-purple-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={deletingItemId === item.id}
                                  >
                                    {deletingItemId === item.id ? (
                                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                    ) : (
                                      <TrashIcon className="h-4 w-4 text-gray-600 hover:text-red-600" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div className={pendingItems.length > 0 ? 'pt-6 border-t border-gray-200' : ''}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Completed ({completedItems.length})
                  </h3>
                  <div className="space-y-3">
                    {completedItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50 opacity-75"
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleToggleComplete(item.id)}
                            className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center transition-colors mt-0.5 flex-shrink-0"
                          >
                            <CheckIcon className="h-3 w-3 text-white" />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-through text-gray-500">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-sm mt-1 line-through text-gray-400">
                                {item.description}
                              </p>
                            )}
                            {item.completedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Completed {new Date(item.completedAt).toLocaleDateString()}
                                {item.completedUser && ` by ${item.completedUser.username}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 