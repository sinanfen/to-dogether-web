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
import { useState, useEffect, useRef } from 'react'
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
  const quickAddInputRef = useRef<HTMLInputElement>(null)

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
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  // Auto focus input after adding item
  useEffect(() => {
    if (!addingItem && quickAddInputRef.current) {
      quickAddInputRef.current.focus()
    }
  }, [addingItem])
  
  const [editItemForm, setEditItemForm] = useState({
    title: '',
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
        setError('Yapılacaklar listesi bulunamadı')
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
      setError('Yapılacaklar listesi yüklenemedi')
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
        severity: priorityToSeverity(newItemForm.priority)
      }

      await api.createTodoItem(listId, itemData)
      
      setNewItemForm({
        title: '',
        priority: 'medium'
      })
      
      setShowAddForm(false)
      await loadTodoList()
    } catch (err) {
      setError('Görev eklenemedi')
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
        severity: priorityToSeverity(editItemForm.priority)
      }

      const updatedItem = await api.updateTodoItem(listId, itemData)
      
      // Update local state instead of reloading
      if (todoList) {
        setTodoList({
          ...todoList,
          items: (todoList.items || []).map(item => 
            item.id === itemId 
              ? { ...item, title: updatedItem.title, severity: updatedItem.severity, priority: severityToPriority(updatedItem.severity) as 'low' | 'medium' | 'high' }
              : item
          )
        })
      }
      
      setEditingItemId(null)
    } catch (err) {
      setError('Görev güncellenemedi')
      console.error('Edit item error:', err)
    } finally {
      setSavingItemId(null)
    }
  }

  const handleToggleComplete = async (itemId: number) => {
    try {
      setToggleingItemId(itemId)
      
      const updatedItem = await api.toggleTodoItem(listId, itemId)
      
      // Update local state instead of reloading
      if (todoList) {
        setTodoList({
          ...todoList,
          items: (todoList.items || []).map(item => 
            item.id === itemId 
              ? { ...item, status: updatedItem.status, isCompleted: updatedItem.status === 1 }
              : item
          )
        })
      }
    } catch (err) {
      setError('Görev durumu değiştirilemedi')
      console.error('Toggle item error:', err)
    } finally {
      setToggleingItemId(null)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      setDeletingItemId(itemId)
      await api.deleteTodoItem(listId, itemId)
      
      // Update local state instead of reloading
      if (todoList) {
        setTodoList({
          ...todoList,
          items: (todoList.items || []).filter(item => item.id !== itemId)
        })
      }
    } catch (err) {
      setError('Görev silinemedi')
      console.error('Delete item error:', err)
    } finally {
      setDeletingItemId(null)
    }
  }

  const startEdit = (item: TodoItem) => {
    setEditingItemId(item.id)
    setEditItemForm({
      title: item.title,
      priority: severityToPriority(item.severity) as 'low' | 'medium' | 'high'
    })
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditItemForm({
      title: '',
      priority: 'medium'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-600 to-pink-600'
      case 'medium': return 'from-yellow-600 to-orange-600'
      case 'low': return 'from-green-600 to-emerald-600'
      default: return 'from-gray-600 to-slate-600'
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
          <p className="text-gray-600">Yükleniyor...</p>
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
                Tekrar Dene
              </Button>
              <Link href="/todo-lists">
                <Button variant="outline">
                  Listelere Dön
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
            Yapılacaklar Listesi Bulunamadı
          </h3>
          <p className="text-gray-600 mb-8">
            Aradığınız yapılacaklar listesi bulunamadı veya erişim iznine sahip değilsiniz.
          </p>
          <Link href="/todo-lists">
            <Button variant="gradient">
              Listelere Dön
            </Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="w-full space-y-6 px-2 sm:px-1">
        {/* Header Section - Compact Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Card - Title and Description */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl shadow-lg text-white p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <button
                onClick={() => router.back()}
                className="mr-2 sm:mr-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Geri"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-purple-100 text-xs sm:text-sm font-medium truncate">
                Yapılacaklar Listesi <span className="mx-1">/</span> <span className="text-white">Detay</span>
              </span>
            </div>
            
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 leading-tight break-words drop-shadow-lg">
              {todoList.title}
            </h1>
            
            {todoList.description && (
              <p className="text-xs sm:text-sm lg:text-base text-purple-100 leading-relaxed break-words">
                {todoList.description}
              </p>
            )}
            
            {/* Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-500"
                  style={{ width: `${todoList.completionPercentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-purple-100 mt-1">İlerleme: {todoList.completionPercentage || 0}%</p>
            </div>
          </div>

          {/* Right Card - Statistics and Actions */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">İstatistikler</h3>
              <Link href={`/todo-lists/${todoList.id}/edit`}>
                <button className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow transition-colors text-xs sm:text-sm gap-1 sm:gap-2 min-w-[32px] sm:min-w-0">
                  <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Düzenle</span>
                </button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                <ListIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{todoList.itemsCount || 0}</div>
                <div className="text-xs text-blue-700 font-medium">Toplam</div>
              </div>
              
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">{todoList.completedItemsCount || 0}</div>
                <div className="text-xs text-green-700 font-medium">Tamamlandı</div>
              </div>
              
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
                <TargetIcon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">{todoList.completionPercentage || 0}%</div>
                <div className="text-xs text-purple-700 font-medium">İlerleme</div>
              </div>
            </div>
          </div>
        </div>
        {/* Add New Item Form */}
        {showAddForm && (
          <div className="relative group w-full max-w-[98vw] mx-auto box-border">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Yeni Görev Ekle</h3>
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
                      Sadece bu listenin görüntülenmesine izin veriyorsunuz. Sadece sahibi görev ekleyebilir.
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görev Başlığı
                  </label>
                  <Input
                    value={newItemForm.title}
                    onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                    placeholder="Görev girin ve Enter tuşuna basın..."
                    className="w-full text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    disabled={isReadOnlyPartnerList()}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
                  <div className="flex space-x-3">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewItemForm({ ...newItemForm, priority })}
                        disabled={isReadOnlyPartnerList()}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          newItemForm.priority === priority
                            ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white border-transparent shadow-lg font-semibold`
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
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
                    İptal Et
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItemForm.title.trim() || addingItem || isReadOnlyPartnerList()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {addingItem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span>Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        <span>Görev Ekle</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Todo Items */}
        <div className="space-y-2 md:space-y-3 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 px-1">Görevler ({todoList.items?.length || 0})</h2>
            
            {/* Removed "Görev Ekle" button */}
            
            {isReadOnlyPartnerList() && (
              <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                <span className="text-xs sm:text-sm text-yellow-700 font-medium">
                  Salt okunur mod
                </span>
              </div>
            )}
          </div>

          {/* Quick Add Input - Always Visible */}
          {canEditItems() && !isReadOnlyPartnerList() && (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 w-full">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  <input
                    ref={quickAddInputRef}
                    type="text"
                    placeholder="Görev ekle..."
                    className="flex-1 bg-transparent border border-gray-200 rounded-full px-3 sm:px-4 py-2 outline-none text-gray-900 placeholder-gray-500 text-sm focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-colors"
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault()
                        const title = e.currentTarget.value.trim()
                        
                        try {
                          setAddingItem(true)
                          setError(null) // Clear previous errors
                          
                          const itemData: CreateTodoItemRequest = {
                            title,
                            severity: priorityToSeverity('medium') // Default to medium priority
                          }
                          
                          console.log('Creating todo item:', itemData)
                          const newItem = await api.createTodoItem(listId, itemData)
                          
                          // Update local state instead of reloading
                          if (todoList) {
                            setTodoList({
                              ...todoList,
                              items: [{
                                ...newItem,
                                isCompleted: false,
                                priority: 'medium'
                              }, ...(todoList.items || [])]
                            })
                          }
                          
                          if (quickAddInputRef.current) {
                            quickAddInputRef.current.value = ''
                            quickAddInputRef.current.focus()
                          }
                        } catch (err) {
                          console.error('Quick add item error details:', err)
                          const errorMessage = err instanceof Error ? err.message : 'Görev eklenemedi'
                          setError(errorMessage)
                        } finally {
                          setAddingItem(false)
                        }
                      }
                    }}
                    disabled={addingItem}
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="sentences"
                  />
                </div>
             
                {addingItem && (
                  <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin flex-shrink-0"></div>
                )}
              </div>
            </div>
          )}

          {todoList.items && todoList.items.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 w-full">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 px-1">Görev Listesi</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 px-1">{todoList.items.length} görev{todoList.items.length !== 1 ? 'ler' : ''}</p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-3">
                  {todoList.items.map((item) => (
                    <div key={item.id} className="group relative">
                      {/* Background gradient based on priority */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${getPriorityBg(item.priority || 'medium')} rounded-xl opacity-30`}></div>
                      
                      {/* Content */}
                      <div className={`relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-gray-300 ${getPriorityShadowColor(item.priority || 'medium')} ${item.isCompleted ? 'opacity-75 shadow-gray-300/50' : ''}`}>
                        {editingItemId === item.id ? (
                          /* Edit Form */
                          <div className="space-y-3">
                            <div>
                              <Input
                                value={editItemForm.title}
                                onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                                placeholder="Görev başlığı..."
                                className="w-full text-base font-medium"
                                onKeyDown={(e) => e.key === 'Enter' && handleEditItem(item.id)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                {(['low', 'medium', 'high'] as const).map((priority) => (
                                  <button
                                    key={priority}
                                    onClick={() => setEditItemForm({ ...editItemForm, priority })}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                                      editItemForm.priority === priority
                                        ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-sm font-semibold`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } active:scale-95 touch-manipulation`}
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
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1.5"
                                >
                                  İptal Et
                                </Button>
                                <Button
                                  onClick={() => handleEditItem(item.id)}
                                  disabled={!editItemForm.title.trim() || savingItemId === item.id}
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-xs px-3 py-1.5"
                                >
                                  {savingItemId === item.id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                                      <span>Kaydediliyor...</span>
                                    </>
                                  ) : (
                                    <span>Kaydet</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="flex items-start space-x-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleComplete(item.id)}
                              disabled={toggleingItemId === item.id || !canEditItems()}
                              className={`relative flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                                item.isCompleted
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent shadow-lg'
                                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                              } ${!canEditItems() ? 'opacity-50 cursor-not-allowed' : ''} active:scale-95 touch-manipulation`}
                            >
                              {toggleingItemId === item.id ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : item.isCompleted ? (
                                <CheckIcon className="w-3 h-3 text-white absolute inset-0 m-auto" />
                              ) : null}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className={`text-base font-semibold transition-all duration-300 ${
                                    item.isCompleted 
                                      ? 'text-gray-500 line-through' 
                                      : 'text-gray-900 group-hover:text-purple-600'
                                  }`}>
                                    {item.title}
                                  </h3>
                                  
                                  {item.description && (
                                    <p className={`mt-1 text-gray-600 text-sm leading-relaxed ${
                                      item.isCompleted ? 'opacity-60 line-through' : ''
                                    }`}>
                                      {item.description}
                                    </p>
                                  )}

                                  {/* Priority Badge */}
                                  <div className="flex items-center space-x-2 mt-2">
                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPriorityColor(item.priority || 'medium')} text-white shadow-sm`}>
                                      {getPriorityIcon(item.priority || 'medium')}
                                      <span className="capitalize">{item.priority || 'medium'}</span>
                                    </div>

                                    <span className="text-xs text-gray-500">
                                      {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                {canEditItems() && (
                                  <div className="flex items-center space-x-1 ml-3">
                                    <button
                                      onClick={() => startEdit(item)}
                                      className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 active:scale-95 touch-manipulation"
                                      title="Görev düzenle"
                                    >
                                      <EditIcon className="w-3 h-3" />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      disabled={deletingItemId === item.id}
                                      className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 disabled:opacity-50 active:scale-95 touch-manipulation"
                                      title="Görev sil"
                                    >
                                      {deletingItemId === item.id ? (
                                        <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                      ) : (
                                        <TrashIcon className="w-3 h-3" />
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
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl opacity-50"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-3xl p-12">
                  <ListIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Henüz Görev Yok
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Bu listenize ilk görev ekleyin. Görevler, öncelikleri ve ilerlemeyi takip edebilirsiniz.
                  </p>
                  {canEditItems() ? (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      İlk Görevinizi Ekle
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Sadece sahibi bu listenin görevlerini ekleyebilir
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