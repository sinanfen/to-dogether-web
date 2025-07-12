'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { 
  PlusIcon, 
  CheckIcon, 
  EditIcon, 
  TrashIcon, 
  ListIcon,
  TargetIcon,
  XMarkIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { api } from '@/lib/api'
import type { TodoList, TodoItem, CreateTodoItemRequest, UpdateTodoItemRequest } from '@/types/api'

// Utility functions for priority/severity mapping
const priorityToSeverity = (priority: string): number => {
  switch (priority) {
    case 'high': return 2
    case 'medium': return 1
    case 'low': return 0
    default: return 1
  }
}

const severityToPriority = (severity: number): string => {
  switch (severity) {
    case 2: return 'high'
    case 1: return 'medium'
    case 0: return 'low'
    default: return 'medium'
  }
}

export default function TodoListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const listId = parseInt(params.id as string)

  const [todoList, setTodoList] = useState<TodoList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingItem, setAddingItem] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [savingItemId, setSavingItemId] = useState<number | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)
  const [toggleingItemId, setToggleingItemId] = useState<number | null>(null)
  
  // Form states
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  
  const [editItemForm, setEditItemForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  // Permission check function
  const canEditItems = () => {
    if (!todoList || !user) return false
    // User can edit if they are the owner OR if the list is shared
    return todoList.ownerId === user.id || todoList.isShared
  }

  // Check if this is a partner's list that is not shared (read-only)
  const isReadOnlyPartnerList = () => {
    if (!todoList || !user) return false
    // If it's not owned by current user and not shared, it's read-only
    return todoList.ownerId !== user.id && !todoList.isShared
  }

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

    if (!listId || isNaN(listId)) {
      router.push('/todo-lists')
      return
    }

    loadTodoList()
  }, [user, router, listId, authLoading])

  const loadTodoList = async () => {
    try {
      setLoading(true)
      setError(null)
      // Önce list bilgisini al
      const list = await api.findTodoList(listId)
      
      if (!list) {
        setError('Todo list not found')
        return
      }
      
      // Sonra items'ları al
      let items: TodoItem[] = []
      try {
        items = await api.getTodoItems(listId)
      } catch {
        items = []
      }
      
      const enhancedItems = items.map(item => ({
        ...item,
        isCompleted: item.status === 1,
        priority: severityToPriority(item.severity) as 'low' | 'medium' | 'high',
        todoListId: listId
      }))
      
      const completedCount = enhancedItems.filter(item => item.isCompleted).length
      const totalCount = enhancedItems.length
      
      const enhancedList = {
        ...list,
        items: enhancedItems,
        colorCode: list.colorCode || '#8B5CF6',
        itemsCount: totalCount,
        completedItemsCount: completedCount,
        completionPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        priority: 'medium' as const,
        // Ensure isShared is boolean
        isShared: Boolean(list.isShared)
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
        severity: priorityToSeverity(newItemForm.priority)
      }

      await api.createTodoItem(listId, itemData)
      
      setNewItemForm({
        title: '',
        description: '',
        priority: 'medium'
      })
      
      setShowAddForm(false)
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
      setSavingItemId(itemId)
      const itemData: UpdateTodoItemRequest = {
        id: itemId,
        title: editItemForm.title.trim(),
        description: editItemForm.description.trim() || undefined,
        severity: priorityToSeverity(editItemForm.priority)
      }

      await api.updateTodoItem(listId, itemData)
      setEditingItemId(null)
      await loadTodoList()
    } catch (err) {
      setError('Failed to update item')
      console.error('Edit item error:', err)
    } finally {
      setSavingItemId(null)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      setDeletingItemId(itemId)
      await api.deleteTodoItem(listId, itemId)
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
      setToggleingItemId(itemId)
      await api.toggleTodoItem(listId, itemId)
      await loadTodoList()
    } catch (err) {
      setError('Failed to toggle item')
      console.error('Toggle item error:', err)
    } finally {
      setToggleingItemId(null)
    }
  }

  const startEdit = (item: TodoItem) => {
    setEditItemForm({
      title: item.title,
      description: item.description || '',
      priority: item.priority || 'medium'
    })
    setEditingItemId(item.id)
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditItemForm({
      title: '',
      description: '',
      priority: 'medium'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'low': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-50 to-pink-50 border-red-200/50'
      case 'medium': return 'from-yellow-50 to-orange-50 border-yellow-200/50'
      case 'low': return 'from-green-50 to-emerald-50 border-green-200/50'
      default: return 'from-gray-50 to-slate-50 border-gray-200/50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <TargetIcon className="w-4 h-4" />
      case 'medium': return <ListIcon className="w-4 h-4" />
      case 'low': return <CheckIcon className="w-4 h-4" />
      default: return <ListIcon className="w-4 h-4" />
    }
  }

  const getPriorityShadowColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'hover:shadow-red-200/40'
      case 'medium': return 'hover:shadow-yellow-200/40'
      case 'low': return 'hover:shadow-green-200/40'
      default: return 'hover:shadow-gray-200/40'
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
        <div className="space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mb-6"></div>
            <div className="flex space-x-4">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Items Skeleton */}
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
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
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <div className="space-x-3">
              <Button 
                onClick={() => loadTodoList()} 
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white"
              >
                Retry
              </Button>
              <Link href="/todo-lists">
                <Button variant="outline">
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
          <ListIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Todo List Not Found
          </h3>
          <p className="text-gray-600 mb-8">
            The todo list you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link href="/todo-lists">
            <Button variant="gradient">
              Back to Lists
            </Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
              <div className="flex-1 mb-6 lg:mb-0">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-purple-100 text-sm mb-4">
                  <Link href="/todo-lists" className="hover:text-white transition-colors">
                    Todo Lists
                  </Link>
                  <span>/</span>
                  <span className="text-white font-medium">Detail</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {todoList.title}
                </h1>

                {/* Description */}
                {todoList.description && (
                  <p className="text-lg text-purple-100 mb-6 max-w-2xl leading-relaxed">
                    {todoList.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ListIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-100">Total Tasks</p>
                      <p className="text-xl font-bold">{todoList.itemsCount || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-100">Completed</p>
                      <p className="text-xl font-bold">{todoList.completedItemsCount || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <TargetIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-100">Progress</p>
                      <p className="text-xl font-bold">{todoList.completionPercentage || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 lg:ml-8">
                {canEditItems() && (
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                )}
                
                {canEditItems() && (
                  <Link href={`/todo-lists/${listId}/edit`}>
                    <Button 
                      variant="outline"
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit List
                    </Button>
                  </Link>
                )}

                {isReadOnlyPartnerList() && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                    <span className="text-sm text-yellow-100 font-medium">
                      Read-only - Partner&apos;s private list
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-white/80 to-white/60 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${todoList.completionPercentage || 0}%` }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Add New Item Form */}
        {showAddForm && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Task</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {isReadOnlyPartnerList() && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-yellow-700 font-medium">
                      You can only view this list. Only the owner can add tasks.
                    </span>
                  </div>
                </div>
              )}

                              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title
                    </label>
                    <Input
                      value={newItemForm.title}
                      onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                      placeholder="Enter task title..."
                      className="w-full"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                      disabled={isReadOnlyPartnerList()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newItemForm.description}
                      onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                      placeholder="Add task description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isReadOnlyPartnerList()}
                    />
                  </div>

                                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex space-x-3">
                      {(['low', 'medium', 'high'] as const).map((priority) => (
                        <button
                          key={priority}
                          onClick={() => setNewItemForm({ ...newItemForm, priority })}
                          disabled={isReadOnlyPartnerList()}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                            newItemForm.priority === priority
                              ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white border-transparent shadow-lg`
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          } ${isReadOnlyPartnerList() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {getPriorityIcon(priority)}
                          <span className="capitalize font-medium">{priority}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItemForm.title.trim() || addingItem || isReadOnlyPartnerList()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {addingItem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        <span>Add Task</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Todo Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Tasks ({todoList.items?.length || 0})
            </h2>
            
            {!showAddForm && canEditItems() && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            )}
            
            {isReadOnlyPartnerList() && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-yellow-700 font-medium">
                  Read-only mode - This is your partner&apos;s private list
                </span>
              </div>
            )}
          </div>

          {todoList.items && todoList.items.length > 0 ? (
            <div className="space-y-4">
              {todoList.items.map((item) => (
                <div key={item.id} className="group relative">
                  {/* Background gradient based on priority */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${getPriorityBg(item.priority || 'medium')} rounded-2xl opacity-50`}></div>
                  
                  {/* Content */}
                  <div className={`relative bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-gray-300 ${getPriorityShadowColor(item.priority || 'medium')} ${item.isCompleted ? 'opacity-75 shadow-gray-300/50' : ''}`}>
                    {editingItemId === item.id ? (
                      /* Edit Form */
                      <div className="space-y-4">
                        <div>
                          <Input
                            value={editItemForm.title}
                            onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                            placeholder="Task title..."
                            className="w-full text-lg font-medium"
                          />
                        </div>

                        <div>
                          <textarea
                            value={editItemForm.description}
                            onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })}
                            placeholder="Task description..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {(['low', 'medium', 'high'] as const).map((priority) => (
                              <button
                                key={priority}
                                onClick={() => setEditItemForm({ ...editItemForm, priority })}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                                  editItemForm.priority === priority
                                    ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-md`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {getPriorityIcon(priority)}
                                <span className="capitalize">{priority}</span>
                              </button>
                            ))}
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleEditItem(item.id)}
                              disabled={!editItemForm.title.trim() || savingItemId === item.id}
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                            >
                              {savingItemId === item.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          disabled={toggleingItemId === item.id || !canEditItems()}
                          className={`relative flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                            item.isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent shadow-lg'
                              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                          } ${!canEditItems() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {toggleingItemId === item.id ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : item.isCompleted ? (
                            <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto" />
                          ) : null}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold transition-all duration-300 ${
                                item.isCompleted 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-900 group-hover:text-purple-600'
                              }`}>
                                {item.title}
                              </h3>
                              
                              {item.description && (
                                <p className={`mt-2 text-gray-600 leading-relaxed ${
                                  item.isCompleted ? 'opacity-60 line-through' : ''
                                }`}>
                                  {item.description}
                                </p>
                              )}

                              {/* Priority Badge */}
                              <div className="flex items-center space-x-3 mt-3">
                                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(item.priority || 'medium')} text-white shadow-sm`}>
                                  {getPriorityIcon(item.priority || 'medium')}
                                  <span className="capitalize">{item.priority || 'medium'}</span>
                                </div>

                                <span className="text-xs text-gray-500">
                                  Created {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            {canEditItems() && (
                              <div className="flex items-center space-x-1 ml-4">
                                <button
                                  onClick={() => startEdit(item)}
                                  className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                                  title="Edit task"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  disabled={deletingItemId === item.id}
                                  className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 disabled:opacity-50"
                                  title="Delete task"
                                >
                                  {deletingItemId === item.id ? (
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                  ) : (
                                    <TrashIcon className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl opacity-50"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-3xl p-12">
                  <ListIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    No Tasks Yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Start by adding your first task to this list. You can create tasks, set priorities, and track your progress.
                  </p>
                  {canEditItems() ? (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add Your First Task
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Only the owner can add tasks to this list
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
} 