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
  XMarkIcon,
  MagnifyingGlassIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Delete confirmation state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TodoItem | null>(null)

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<TodoItem | null>(null)
  const [dragOverItem, setDragOverItem] = useState<TodoItem | null>(null)
  const [, setIsReordering] = useState(false)

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

  // Filter and sort items - completed items go to bottom, then by order
  const filteredItems = (todoList?.items?.filter(item =>
    item.title.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')) ||
    (item.description && item.description.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')))
  ) || []).sort((a, b) => {
    // Completed items go to bottom
    if (a.isCompleted && !b.isCompleted) return 1
    if (!a.isCompleted && b.isCompleted) return -1
    // Then sort by order
    return (a.order || 0) - (b.order || 0)
  })

  const loadTodoList = useCallback(async () => {
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
  }, [listId])

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
  }, [user, router, listId, authLoading, loadTodoList])

  // Disable body scroll when dragging
  useEffect(() => {
    if (draggedItem) {
      // Disable scroll on body when dragging
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      // Re-enable scroll when not dragging
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [draggedItem])

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
      setDeleteConfirmItem(null)
    } catch (err) {
      setError('Görev silinemedi')
      console.error('Delete item error:', err)
    } finally {
      setDeletingItemId(null)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (item: TodoItem) => {
    if (item.isCompleted) return // Don't drag completed items
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent, item: TodoItem) => {
    e.preventDefault()
    if (item.isCompleted || item.id === draggedItem?.id) return
    setDragOverItem(item)
  }

  const handleDragEnd = async () => {
    if (!draggedItem || !dragOverItem || !todoList?.items) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    // Get only non-completed items for reordering
    const nonCompletedItems = todoList.items.filter(item => !item.isCompleted)
    const draggedIndex = nonCompletedItems.findIndex(item => item.id === draggedItem.id)
    const dropIndex = nonCompletedItems.findIndex(item => item.id === dragOverItem.id)

    if (draggedIndex === -1 || dropIndex === -1 || draggedIndex === dropIndex) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    // Reorder items locally
    const reorderedItems = [...nonCompletedItems]
    const [removed] = reorderedItems.splice(draggedIndex, 1)
    reorderedItems.splice(dropIndex, 0, removed)

    // Create new order mapping
    const reorderData = reorderedItems.map((item, index) => ({
      itemId: item.id,
      newOrder: index + 1
    }))

    // Optimistic update
    const updatedItems = todoList.items.map(item => {
      const newOrderItem = reorderData.find(r => r.itemId === item.id)
      return newOrderItem ? { ...item, order: newOrderItem.newOrder } : item
    })

    setTodoList({ ...todoList, items: updatedItems })
    setDraggedItem(null)
    setDragOverItem(null)

    // Call API to persist reorder
    try {
      setIsReordering(true)
      await api.reorderTodoItems(listId, { items: reorderData })
    } catch (err) {
      console.error('Reorder error:', err)
      // Revert on error
      await loadTodoList()
    } finally {
      setIsReordering(false)
    }
  }

  // Touch drag handlers for mobile
  const touchStartY = useRef<number>(0)
  const touchCurrentItem = useRef<TodoItem | null>(null)

  const handleTouchStart = (e: React.TouchEvent, item: TodoItem) => {
    if (item.isCompleted) return
    e.preventDefault() // Prevent scroll when starting drag
    touchStartY.current = e.touches[0].clientY
    touchCurrentItem.current = item
    setDraggedItem(item)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchCurrentItem.current || !todoList?.items) return
    e.preventDefault() // Prevent scroll during drag

    const touch = e.touches[0]
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY)

    for (const el of elements) {
      const itemId = el.getAttribute('data-item-id')
      if (itemId) {
        const item = todoList.items.find(i => i.id === parseInt(itemId))
        if (item && !item.isCompleted && item.id !== touchCurrentItem.current.id) {
          setDragOverItem(item)
          break
        }
      }
    }
  }

  const handleTouchEnd = () => {
    if (draggedItem && dragOverItem) {
      handleDragEnd()
    } else {
      setDraggedItem(null)
      setDragOverItem(null)
    }
    touchCurrentItem.current = null
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
      case 'high': return 'from-red-600 to-orange-600'
      case 'medium': return 'from-yellow-600 to-orange-600'
      case 'low': return 'from-green-600 to-emerald-600'
      default: return 'from-gray-600 to-slate-600'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-50 to-orange-50 border-red-200/50'
      case 'medium': return 'from-yellow-50 to-orange-50 border-yellow-200/50'
      case 'low': return 'from-green-50 to-emerald-50 border-green-200/50'
      default: return 'from-gray-50 to-slate-50 border-gray-200/50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <TargetIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      case 'medium': return <ListIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      case 'low': return <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
      default: return <ListIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <div className="space-y-6 animate-pulse px-2 sm:px-0">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="h-6 w-48 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-72 bg-gray-200 rounded mb-4"></div>
            <div className="flex flex-wrap gap-3">
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-20 bg-gray-200 rounded"></div>
              <div className="h-5 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Items Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-md">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
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
        <div className="text-center py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-4 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button
                onClick={() => loadTodoList()}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white text-sm"
              >
                Tekrar Dene
              </Button>
              <Link href="/todo-lists">
                <Button variant="outline" className="w-full sm:w-auto text-sm">
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
        <div className="text-center py-8 px-4">
          <ListIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            Yapılacaklar Listesi Bulunamadı
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-sm mx-auto">
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
      <div className="w-full space-y-4 sm:space-y-6 px-1 sm:px-2">
        {/* Delete Confirmation Modal */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 sm:p-6 animate-fade-in">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Görevi Sil</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  <span className="font-medium text-gray-900">&quot;{deleteConfirmItem.title}&quot;</span> görevini silmek istediğinizden emin misiniz?
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-5">Bu işlem geri alınamaz.</p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setDeleteConfirmItem(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleDeleteItem(deleteConfirmItem.id)}
                    disabled={deletingItemId === deleteConfirmItem.id}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {deletingItemId === deleteConfirmItem.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Siliniyor...
                      </>
                    ) : (
                      'Evet, Sil'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Section - Compact Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Left Card - Title and Description */}
          <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-orange-500 rounded-xl shadow-lg text-white p-3 sm:p-5">
            <div className="flex items-center mb-2 sm:mb-3">
              <button
                onClick={() => router.back()}
                className="mr-2 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Geri"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-purple-100 text-xs font-medium truncate">
                Yapılacaklar <span className="mx-1">/</span> <span className="text-white">Detay</span>
              </span>
            </div>

            <h1 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 leading-tight break-words drop-shadow-lg line-clamp-2">
              {todoList.title}
            </h1>

            {todoList.description && (
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed break-words line-clamp-2">
                {todoList.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-2 sm:mt-3">
              <div className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-500"
                  style={{ width: `${todoList.completionPercentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-purple-100 mt-1">İlerleme: {todoList.completionPercentage || 0}%</p>
            </div>
          </div>

          {/* Right Card - Statistics and Actions */}
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">İstatistikler</h3>
              <Link href={`/todo-lists/${todoList.id}/edit`}>
                <button className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white font-medium px-2 sm:px-3 py-1.5 rounded-lg shadow transition-colors text-xs gap-1">
                  <EditIcon className="w-3 h-3" />
                  <span className="hidden xs:inline">Düzenle</span>
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                <ListIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-base sm:text-lg font-bold text-blue-900">{todoList.itemsCount || 0}</div>
                <div className="text-[10px] sm:text-xs text-blue-700 font-medium">Toplam</div>
              </div>

              <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1" />
                <div className="text-base sm:text-lg font-bold text-green-900">{todoList.completedItemsCount || 0}</div>
                <div className="text-[10px] sm:text-xs text-green-700 font-medium">Tamamlandı</div>
              </div>

              <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg border border-purple-200/50">
                <TargetIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-base sm:text-lg font-bold text-purple-900">{todoList.completionPercentage || 0}%</div>
                <div className="text-[10px] sm:text-xs text-purple-700 font-medium">İlerleme</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Item Form */}
        {showAddForm && (
          <div className="relative group w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl opacity-50"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Yeni Görev Ekle</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {isReadOnlyPartnerList() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-xs sm:text-sm text-yellow-700 font-medium">
                      Sadece bu listenin görüntülenmesine izin veriyorsunuz.
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
                    placeholder="Görev girin..."
                    className="w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    disabled={isReadOnlyPartnerList()}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewItemForm({ ...newItemForm, priority })}
                        disabled={isReadOnlyPartnerList()}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm ${newItemForm.priority === priority
                          ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white border-transparent shadow-lg font-semibold`
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          } ${isReadOnlyPartnerList() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {getPriorityIcon(priority)}
                        <span className="capitalize">{priority === 'low' ? 'Düşük' : priority === 'medium' ? 'Orta' : 'Yüksek'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm w-full sm:w-auto"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItemForm.title.trim() || addingItem || isReadOnlyPartnerList()}
                    className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-sm w-full sm:w-auto"
                  >
                    {addingItem ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span>Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-1.5" />
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
        <div className="space-y-3 w-full">
          <div className="flex flex-col gap-3">
            {/* Header with title */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Görevler ({filteredItems.length}{searchQuery && ` / ${todoList.items?.length || 0}`})
              </h2>

              {isReadOnlyPartnerList() && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  <span className="text-xs text-yellow-700 font-medium">Salt okunur</span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Görev ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Input - Always Visible */}
          {canEditItems() && !isReadOnlyPartnerList() && (
            <div className="bg-white rounded-lg shadow-md p-3 w-full">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                <input
                  ref={quickAddInputRef}
                  type="text"
                  placeholder="Yeni görev ekle ve Enter'a bas..."
                  className="flex-1 bg-transparent border border-gray-200 rounded-md px-3 py-2 outline-none text-gray-900 placeholder-gray-400 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition-colors"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      e.preventDefault()
                      const title = e.currentTarget.value.trim()

                      try {
                        setAddingItem(true)
                        setError(null)

                        const itemData: CreateTodoItemRequest = {
                          title,
                          severity: priorityToSeverity('medium')
                        }

                        const newItem = await api.createTodoItem(listId, itemData)

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
                        console.error('Quick add item error:', err)
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
                />
                {addingItem && (
                  <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin flex-shrink-0"></div>
                )}
              </div>
            </div>
          )}

          {filteredItems.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Görev Listesi</h3>
              </div>
              <div className="max-h-[55vh] overflow-y-auto">
                <div className="p-2 sm:p-3 space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group relative ${draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''} ${dragOverItem?.id === item.id ? 'ring-2 ring-purple-400 ring-offset-2' : ''} transition-all duration-200`}
                      data-item-id={item.id}
                      draggable={!item.isCompleted && canEditItems()}
                      onDragStart={() => handleDragStart(item)}
                      onDragOver={(e) => handleDragOver(e, item)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, item)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Background gradient based on priority */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${getPriorityBg(item.priority || 'medium')} rounded-lg opacity-30`}></div>

                      {/* Content */}
                      <div className={`relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 ${getPriorityShadowColor(item.priority || 'medium')} ${item.isCompleted ? 'opacity-70' : ''}`}>
                        {/* Drag handle for non-completed items */}
                        {!item.isCompleted && canEditItems() && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="8" cy="6" r="2" />
                              <circle cx="16" cy="6" r="2" />
                              <circle cx="8" cy="12" r="2" />
                              <circle cx="16" cy="12" r="2" />
                              <circle cx="8" cy="18" r="2" />
                              <circle cx="16" cy="18" r="2" />
                            </svg>
                          </div>
                        )}
                        {editingItemId === item.id ? (
                          /* Edit Form */
                          <div className="space-y-3">
                            <Input
                              value={editItemForm.title}
                              onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
                              placeholder="Görev başlığı..."
                              className="w-full text-sm"
                              onKeyDown={(e) => e.key === 'Enter' && handleEditItem(item.id)}
                              autoFocus
                            />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex flex-wrap gap-1.5">
                                {(['low', 'medium', 'high'] as const).map((priority) => (
                                  <button
                                    key={priority}
                                    onClick={() => setEditItemForm({ ...editItemForm, priority })}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${editItemForm.priority === priority
                                      ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-sm font-semibold`
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      } active:scale-95`}
                                  >
                                    {getPriorityIcon(priority)}
                                    <span className="capitalize hidden xs:inline">{priority === 'low' ? 'Düşük' : priority === 'medium' ? 'Orta' : 'Yüksek'}</span>
                                  </button>
                                ))}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={cancelEdit}
                                  className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-xs font-medium"
                                >
                                  İptal
                                </button>
                                <button
                                  onClick={() => handleEditItem(item.id)}
                                  disabled={!editItemForm.title.trim() || savingItemId === item.id}
                                  className="flex-1 sm:flex-none px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  {savingItemId === item.id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      <span>Kaydediliyor...</span>
                                    </>
                                  ) : (
                                    <span>Kaydet</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="flex items-start gap-2.5">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleComplete(item.id)}
                              disabled={toggleingItemId === item.id || !canEditItems()}
                              className={`relative flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-300 mt-0.5 ${item.isCompleted
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent shadow-md'
                                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                } ${!canEditItems() ? 'opacity-50 cursor-not-allowed' : ''} active:scale-95`}
                            >
                              {toggleingItemId === item.id ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : item.isCompleted ? (
                                <CheckIcon className="w-3 h-3 text-white absolute inset-0 m-auto" />
                              ) : null}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-sm font-medium transition-all duration-300 break-words ${item.isCompleted
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900'
                                    }`}>
                                    {item.title}
                                  </h3>

                                  {/* Priority Badge & Date */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${getPriorityColor(item.priority || 'medium')} text-white shadow-sm`}>
                                      {getPriorityIcon(item.priority || 'medium')}
                                      <span className="capitalize">{item.priority === 'low' ? 'Düşük' : item.priority === 'medium' ? 'Orta' : item.priority === 'high' ? 'Yüksek' : 'Orta'}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                {canEditItems() && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => startEdit(item)}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-95"
                                      title="Düzenle"
                                    >
                                      <EditIcon className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setDeleteConfirmItem(item)}
                                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all active:scale-95"
                                      title="Sil"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5" />
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
            <div className="text-center py-10 px-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-orange-100 rounded-2xl opacity-50"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-8">
                  <ListIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'Görev Bulunamadı' : 'Henüz Görev Yok'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
                    {searchQuery
                      ? `"${searchQuery}" araması için sonuç bulunamadı.`
                      : 'Bu listeye ilk görevinizi ekleyin.'
                    }
                  </p>
                  {!searchQuery && canEditItems() && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 shadow-lg"
                    >
                      <PlusIcon className="w-4 h-4 mr-1.5" />
                      İlk Görevinizi Ekleyin
                    </Button>
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