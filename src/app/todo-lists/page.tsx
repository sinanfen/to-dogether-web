'use client'

import { AppLayout } from '@/components/layout'
import { ListIcon, PlusIcon, EditIcon, TrashIcon, UsersIcon, EyeIcon, EyeSlashIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { TodoList } from '@/types/api'

export default function TodoListsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'my' | 'partner'>('my')
  const [myLists, setMyLists] = useState<TodoList[]>([])
  const [partnerLists, setPartnerLists] = useState<TodoList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingListId, setDeletingListId] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; list: TodoList | null }>({
    isOpen: false,
    list: null
  })

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

    loadTodoLists()
  }, [user, router, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodoLists = async () => {
    try {
      setLoading(true)
      setError(null)
      // Load user's own lists
      const userLists = await api.getTodoLists()
      
      // Enhance user lists with real item counts (like dashboard)
      const enhancedUserLists = await Promise.all(
        userLists.map(async (list) => {
          try {
            // Get real item counts for each list
            const items = await api.getTodoItems(list.id)
            const completedItems = items.filter(item => item.status === 1).length
            const totalItems = items.length
            const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
            
            return {
              ...list,
              colorCode: list.colorCode,
              itemsCount: totalItems,
              completedItemsCount: completedItems,
              completionPercentage: completionPercentage,
              priority: 'medium' as const,
              isShared: list.isShared
            }
          } catch (error) {
            console.error(`Failed to fetch items for list ${list.id}:`, error)
            // Fallback to basic list info if items fetch fails
            return {
              ...list,
              colorCode: list.colorCode,
              itemsCount: 0,
              completedItemsCount: 0,
              completionPercentage: 0,
              priority: 'medium' as const,
              isShared: list.isShared
            }
          }
        })
      )
      
      setMyLists(enhancedUserLists)

      // Load partner's lists if partner exists
      if (user?.partner) {
        try {
          const partnerTodoLists = await api.getPartnerTodoLists()
          
          // Enhance partner lists with real item counts (like dashboard)
          const enhancedPartnerLists = await Promise.all(
            partnerTodoLists.map(async (list) => {
              try {
                // Get real item counts for each list
                const items = await api.getTodoItems(list.id)
                const completedItems = items.filter(item => item.status === 1).length
                const totalItems = items.length
                const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
                
                return {
                  ...list,
                  colorCode: list.colorCode,
                  itemsCount: totalItems,
                  completedItemsCount: completedItems,
                  completionPercentage: completionPercentage,
                  priority: 'medium' as const,
                  isShared: list.isShared
                }
              } catch (error) {
                console.error(`Failed to fetch items for list ${list.id}:`, error)
                // Fallback to basic list info if items fetch fails
                return {
                  ...list,
                  colorCode: list.colorCode,
                  itemsCount: 0,
                  completedItemsCount: 0,
                  completionPercentage: 0,
                  priority: 'medium' as const,
                  isShared: list.isShared
                }
              }
            })
          )
          
          setPartnerLists(enhancedPartnerLists)
        } catch (partnerError) {
          console.error('❌ Partner listeleri yüklenemedi:', partnerError)
          // Don't throw error for partner lists, just log it
          setPartnerLists([])
        }
      } else {
        setPartnerLists([])
      }
    } catch (err) {
      console.error('❌ Todo listeleri yükleme hatası:', err)
      setError('Yapılacaklar listeleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const openDeleteDialog = (list: TodoList) => {
    setDeleteDialog({ isOpen: true, list })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, list: null })
  }

  const handleDeleteList = async () => {
    if (!deleteDialog.list) return

    try {
      setDeletingListId(deleteDialog.list.id)
      await api.deleteTodoList(deleteDialog.list.id)
      
      // Close dialog and refresh the lists
      closeDeleteDialog()
      await loadTodoLists()
    } catch (err) {
      setError('Yapılacaklar listesi silinemedi')
      console.error('Liste silme hatası:', err)
    } finally {
      setDeletingListId(null)
    }
  }

  const currentLists = activeTab === 'my' ? myLists : partnerLists



  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null // Will be redirected by useEffect
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yapılacaklar Listeleri</h1>
            <p className="text-gray-600 mt-2">
              Görevlerinizi organize edin ve partnerinizle iş birliği yapın
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <div className="relative group">
              {/* Animated Border Background */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{
                     background: 'conic-gradient(from var(--angle), transparent 70%, rgb(168 85 247) 80%, rgb(236 72 153) 85%, rgb(239 68 68) 90%, transparent 95%)',
                     animation: 'border-spin 2s linear infinite',
                     padding: '2px'
                   }}>
              </div>
              
              <Link href="/todo-lists/new">
                <Button 
                  variant="gradient" 
                  size="sm" 
                  className="w-full px-3 py-1.5 h-10 relative flex items-center space-x-2 overflow-hidden group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-400/50 transition-all duration-500 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-400 hover:via-pink-400 hover:to-red-400"
                >
                  {/* Inner Background */}
                  <div className="absolute inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-red-400 transition-all duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <div className="relative">
                      <PlusIcon className="h-5 w-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-90" />
                      {/* Plus icon glow effect */}
                      <div className="absolute inset-0 h-5 w-5 opacity-0 group-hover:opacity-50 transition-opacity duration-500">
                        <PlusIcon className="h-5 w-5 text-white/60 scale-150 animate-ping" />
                      </div>
                    </div>
                    <span className="font-semibold tracking-wide">Yeni Liste Oluştur</span>
                    
                    {/* Magic sparkle */}
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>
                  </div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slow rounded-lg"></div>
                  
                  {/* Sparkle Effects */}
                  <div className="absolute top-1 right-3 w-0.5 h-0.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute bottom-1 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping" style={{animationDelay: '0.4s'}}></div>
                  <div className="absolute top-1/2 right-8 w-0.5 h-0.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping" style={{animationDelay: '0.6s'}}></div>
                </Button>
              </Link>
            </div>
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
              Tekrar Dene
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm h-8 sm:h-9 ${
                activeTab === 'my'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListIcon className="h-4 w-4" />
              <span>Benim Listelerim ({myLists.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm h-8 sm:h-9 ${
                activeTab === 'partner'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={!user.partner}
            >
              <UsersIcon className="h-4 w-4" />
              <span>
                {user.partner ? `Partner Listeleri (${partnerLists.length})` : 'Partner Yok'}
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
                    className={`group bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${
                      isDeleting ? 'opacity-50' : ''
                    }`}
                    style={{
                      border: `2px solid ${list.colorCode}`,
                      boxShadow: `0 0 0 1px ${list.colorCode}20, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
                    }}
                  >
                    {/* Subtle gradient overlay */}
                    <div 
                      className="absolute inset-0 opacity-5 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${list.colorCode}00 0%, ${list.colorCode}20 50%, ${list.colorCode}00 100%)`
                      }}
                    />
                    
                    {/* Animated border glow on hover */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `linear-gradient(45deg, ${list.colorCode}10, ${list.colorCode}05, ${list.colorCode}10)`,
                        boxShadow: `inset 0 0 20px ${list.colorCode}20`
                      }}
                    />
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
                      
                      <div className="flex items-center space-x-1">
                        {/* Privacy Status Icon */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-200" title={list.isShared ? "Genel - Paylaşıldı" : "Özel - Partner'in özel listesi"}>
                          {list.isShared ? (
                            <EyeIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        
                        {activeTab === 'my' && (
                          <>
                            <Link href={`/todo-lists/${list.id}/edit`}>
                              <button 
                                className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={isDeleting}
                              >
                                <EditIcon className="h-4 w-4 text-gray-600 hover:text-purple-600" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => openDeleteDialog(list)}
                              className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                              ) : (
                                <TrashIcon className="h-4 w-4 text-gray-600 hover:text-red-600" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
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
                          {list.completedItemsCount || 0} of {list.itemsCount || 0} tamamlandı
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          {list.completionPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 rounded-full transition-all duration-300 relative"
                          style={{ 
                            width: `${list.completionPercentage || 0}%`,
                            background: `linear-gradient(90deg, ${list.colorCode}80, ${list.colorCode})`
                          }}
                        >
                          {/* Shimmer effect */}
                          <div 
                            className="absolute inset-0 opacity-30"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${list.colorCode}40, transparent)`,
                              animation: 'shimmer 2s infinite'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                          {list.priority}
                        </span>
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
                        <p>Oluşturulma: {new Date(list.createdAt).toLocaleDateString()}</p>
                        {list.lastActivity && (
                          <p>Son aktivite: {new Date(list.lastActivity).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <Link href={`/todo-lists/${list.id}`}>
                        <div className="relative opacity-100 translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-all sm:duration-300 sm:transform sm:translate-y-2 sm:group-hover:translate-y-0">
                          <button
                            className="relative group/btn text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer"
                            style={{
                              background: `linear-gradient(135deg, ${list.colorCode}, ${list.colorCode}dd)`,
                              boxShadow: `0 4px 6px -1px ${list.colorCode}40, 0 2px 4px -1px ${list.colorCode}20`
                            }}
                            disabled={isDeleting}
                          >
                            {/* Background shimmer effect */}
                            <div 
                              className="absolute inset-0 opacity-0 group-hover/btn:opacity-30 transition-opacity duration-500 animate-shimmer rounded-lg"
                              style={{
                                background: `linear-gradient(90deg, transparent, ${list.colorCode}40, transparent)`
                              }}
                            ></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center space-x-2">
                              <span className="text-sm">Detayları Görüntüle</span>
                              <svg 
                                className="w-4 h-4 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            
                            {/* Glow effect */}
                            <div 
                              className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-xl"
                              style={{
                                background: `linear-gradient(135deg, ${list.colorCode}20, ${list.colorCode}10)`
                              }}
                            ></div>
                            
                            {/* Sparkle effects */}
                            <div 
                              className="absolute top-1 right-2 w-1 h-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 animate-ping" 
                              style={{
                                backgroundColor: list.colorCode,
                                animationDelay: '0.1s'
                              }}
                            ></div>
                            <div 
                              className="absolute bottom-1 left-3 w-0.5 h-0.5 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 animate-ping" 
                              style={{
                                backgroundColor: list.colorCode,
                                animationDelay: '0.3s'
                              }}
                            ></div>
                          </button>
                        </div>
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
                    Henüz Yapılacaklar Listesi Yok
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Görevlerinizi organize etmek için ilk yapılacaklar listesini oluşturun.
                  </p>
                  <Link href="/todo-lists/new">
                    <Button variant="gradient" size="lg">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      İlk Yapılacaklar Listesi Oluştur
                    </Button>
                  </Link>
                </>
              ) : user.partner ? (
                <>
                  <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Partner Listeleri Yok
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Partneriniz henüz yapılacaklar listesi oluşturmadı veya size liste paylaşmadı.
                  </p>
                  <Link href="/partner">
                    <Button variant="outline">
                      Partner Genel Bakışına Git
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Partnerle İletişime Geçin
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Partnerinizle iletişime geçin ve onların yapılacaklar listelerini görüntüleyin.
                  </p>
                  <Link href="/profile">
                    <Button variant="gradient">
                      Partnerle İletişime Geç
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
              <p className="text-gray-600 font-medium">Toplam Liste</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {myLists.reduce((acc, list) => acc + (list.completedItemsCount || 0), 0) + 
                 partnerLists.reduce((acc, list) => acc + (list.completedItemsCount || 0), 0)}
              </p>
              <p className="text-gray-600 font-medium">Tamamlanan Görevler</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {myLists.reduce((acc, list) => acc + ((list.itemsCount || 0) - (list.completedItemsCount || 0)), 0) + 
                 partnerLists.reduce((acc, list) => acc + ((list.itemsCount || 0) - (list.completedItemsCount || 0)), 0)}
              </p>
              <p className="text-gray-600 font-medium">Devam Eden Görevler</p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialog.isOpen && deleteDialog.list && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-md transition-all duration-300"
              onClick={closeDeleteDialog}
            />
            
            {/* Dialog */}
            <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 mx-4 max-w-md w-full transform transition-all duration-300 scale-100 hover:scale-[1.02]">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrashIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Yapılacaklar Listesi Sil</h3>
                  <p className="text-sm text-gray-500">Bu işlem geri alınamaz</p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  <span className="font-semibold text-gray-900">&ldquo;{deleteDialog.list.title}&rdquo;</span> adlı yapılacaklar listesini silmek istediğinize emin misiniz?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium mb-1">Bu işlem şunları siler:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Yapılacaklar listesi ve açıklaması</li>
                        <li>• Bu listedeki tüm {deleteDialog.list.itemsCount || 0} görev</li>
                        <li>• İlgili tüm veriler ve ilerleme</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteDialog}
                  className="px-4 py-2"
                  disabled={deletingListId === deleteDialog.list.id}
                >
                  İptal Et
                </Button>
                <Button
                  onClick={handleDeleteList}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deletingListId === deleteDialog.list.id}
                >
                  {deletingListId === deleteDialog.list.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-red-200 border-t-red-400 rounded-full animate-spin" />
                      <span>Siliniyor...</span>
                    </div>
                  ) : (
                    'Listeyi Sil'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
} 