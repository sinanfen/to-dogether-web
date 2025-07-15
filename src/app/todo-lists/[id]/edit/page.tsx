'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'
import { 
  ListIcon, 
  ArrowLeftIcon,
  SaveIcon,
  XMarkIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth'
import { api } from '@/lib/api'
import type { UpdateTodoListRequest } from '@/types/api'

export default function EditTodoListPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listId = parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    colorCode: '#8B5CF6',
    isShared: true
  })

  const [useCustomColor, setUseCustomColor] = useState(false)

  const colorOptions = [
    { name: 'Mor', value: '#8B5CF6' },
    { name: 'Pembe', value: '#EC4899' },
    { name: 'Mavi', value: '#3B82F6' },
    { name: 'Yeşil', value: '#10B981' },
    { name: 'Turuncu', value: '#F59E0B' },
    { name: 'Kırmızı', value: '#EF4444' },
    { name: 'İndigo', value: '#6366F1' },
    { name: 'Turkuaz', value: '#14B8A6' },
  ]



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

      const list = await api.findTodoList(listId)
      
      if (!list) {
        setError('Yapılacaklar listesi bulunamadı')
        return
      }

      // Check if user owns this list OR if the list is shared
      if (list.ownerId !== user?.id && !list.isShared) {
        setError('Sadece kendi listelerinizi veya paylaşılan listeleri düzenleyebilirsiniz')
        return
      }

      setFormData({
        title: list.title,
        description: list.description || '',
        colorCode: list.colorCode || '#8B5CF6',
        isShared: list.isShared
      })
    } catch (err) {
      console.error('❌ Todo list loading error:', err)
      setError('Yapılacaklar listesi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Lütfen bir liste başlığı girin')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updateData: UpdateTodoListRequest = {
        id: listId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        isShared: formData.isShared,
        colorCode: formData.colorCode
      }

      await api.updateTodoList(updateData)
      
      // Redirect back to the list
      router.push(`/todo-lists/${listId}`)
    } catch (err) {
      setError('Yapılacaklar listesi güncellenemedi. Lütfen tekrar deneyin.')
      console.error('Update todo list error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Form Skeleton */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
              <div className="h-10 w-full bg-gray-200 rounded"></div>
              <div className="h-20 w-full bg-gray-200 rounded"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Hata</h3>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <div className="flex items-center justify-center space-x-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Tekrar Dene
                </Button>
                <Link href="/todo-lists">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Listelere Dön
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/todo-lists/${listId}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Listeye Dön</span>
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ListIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yapılacaklar Listesini Düzenle</h1>
              <p className="text-gray-600">Liste ayarlarınızı ve bilgilerinizi güncelleyin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Temel Bilgiler
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liste Başlığı *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Liste başlığı girin..."
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Liste için isteğe bağlı açıklama..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Liste Rengi
              </h2>
              
              <div className="space-y-4">
                {/* Current Color Preview */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div 
                    className="w-16 h-16 rounded-xl border-2 border-white shadow-lg ring-1 ring-gray-200"
                    style={{ backgroundColor: formData.colorCode }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Seçilen Renk</p>
                    <p className="text-xs text-gray-500 font-mono">{formData.colorCode}</p>
                  </div>
                </div>

                {/* Color Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Renk Seçenekleri
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, colorCode: color.value }))}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.colorCode === color.value
                            ? 'border-gray-400 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded-lg mb-2"
                          style={{ backgroundColor: color.value }}
                        />
                        <p className="text-xs font-medium text-gray-700 text-center">{color.name}</p>
                        {formData.colorCode === color.value && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-purple-600 rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Option */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setUseCustomColor(!useCustomColor)}
                    className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.colorCode }} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Özel Renk</p>
                        <p className="text-xs text-gray-600">Kendi renginizi seçin</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      useCustomColor ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {useCustomColor && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full m-auto" />
                      )}
                    </div>
                  </button>
                  
                  {useCustomColor && (
                    <div className="mt-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.colorCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-purple-400 transition-colors"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.colorCode}
                            onChange={(e) => {
                              const value = e.target.value
                              if (/^#[0-9A-F]{6}$/i.test(value)) {
                                setFormData(prev => ({ ...prev, colorCode: value }))
                              }
                            }}
                            placeholder="#8B5CF6"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Sharing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Paylaşım Ayarları
              </h2>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ortakla Paylaş</h3>
                      <p className="text-sm text-gray-600">Bu listenin ortakla görüntülenmesine ve düzenlenmesine izin verin</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isShared: !prev.isShared }))}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.isShared ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div 
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        formData.isShared ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {formData.isShared && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">Liste ortakla paylaşılıyor</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href={`/todo-lists/${listId}`}>
                <Button 
                  variant="outline"
                  className="px-6"
                >
                  İptal Et
                </Button>
              </Link>
              
              <Button 
                type="submit"
                disabled={saving || !formData.title.trim()}
                className="px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-400 rounded-full animate-spin" />
                    <span>Kaydediliyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <SaveIcon className="w-4 h-4" />
                    <span>Değişiklikleri Kaydet</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
} 