'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Input, Button, PriorityDropdown } from '@/components/ui'
import {
  ListIcon,
  PlusIcon,
  HomeIcon,
  ShareIcon,
  UsersIcon,
  TargetIcon
} from '@/components/ui/icons'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth'
import { api } from '@/lib/api'
import type { CreateTodoListRequest } from '@/types/api'

interface TodoListTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
  color: string
}

const templates: TodoListTemplate[] = [
  {
    id: 'home-chores',
    name: 'Haftalık Ev İşleri',
    description: 'Ev işlerini organize edin ve paylaşın',
    icon: HomeIcon,
    color: '#10B981',
    items: [
      'Bulaşık yıkama',
      'Çamaşır yıkama ve kurutma',
      'Evi süpürme ve silme',
      'Banyo temizliği',
      'Mutfak temizliği',
      'Yatak takımlarını değiştirme'
    ]
  },
  {
    id: 'grocery-shopping',
    name: 'Market Alışverişi',
    description: 'Alışveriş listesi oluşturun ve takip edin',
    icon: ShareIcon,
    color: '#3B82F6',
    items: [
      'Süt ve süt ürünleri',
      'Et ve tavuk',
      'Sebze ve meyve',
      'Ekmek ve unlu mamüller',
      'Temizlik malzemeleri',
      'Kişisel bakım ürünleri'
    ]
  },
  {
    id: 'vacation-planning',
    name: 'Tatil Planlaması',
    description: 'Tatil hazırlıklarınızı birlikte yapın',
    icon: TargetIcon,
    color: '#F97316',
    items: [
      'Otel rezervasyonu',
      'Uçak bileti alma',
      'Vize işlemleri',
      'Bavul hazırlama',
      'Pasaport kontrolü',
      'Sigorta işlemleri',
      'Aktivite planlaması'
    ]
  },
  {
    id: 'work-projects',
    name: 'İş Projeleri',
    description: 'İş görevlerinizi organize edin',
    icon: ListIcon,
    color: '#F59E0B',
    items: [
      'Proje toplantısı',
      'Rapor hazırlama',
      'Client görüşmesi',
      'Sunum hazırlığı',
      'Email yanıtlama'
    ]
  },
  {
    id: 'date-planning',
    name: 'Randevu Planları',
    description: 'Romantik anlar için plan yapın',
    icon: UsersIcon,
    color: '#8B5CF6',
    items: [
      'Restoran rezervasyonu',
      'Film/konser bileti',
      'Hediye alışverişi',
      'Romantik aktivite',
      'Fotoğraf çekimi'
    ]
  },
  {
    id: 'fitness-goals',
    name: 'Fitness Hedefleri',
    description: 'Sağlık hedeflerinizi birlikte takip edin',
    icon: TargetIcon,
    color: '#EF4444',
    items: [
      'Gym antrenmanı',
      'Günlük yürüyüş',
      'Sağlıklı yemek planı',
      'Su içme takibi',
      'Uyku düzeni'
    ]
  }
]

export default function NewTodoListPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<'template' | 'form'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TodoListTemplate | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    colorCode: '#8B5CF6',
    isShared: true
  })

  const [initialItems, setInitialItems] = useState<{ title: string; priority: 'low' | 'medium' | 'high' }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quickAddItem, setQuickAddItem] = useState('')

  useEffect(() => {
    // Only redirect to login if user is not authenticated and auth loading is complete
    if (!user && !authLoading) {
      router.push('/auth/login')
      return
    }
  }, [user, router, authLoading])

  const handleQuickAddItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickAddItem.trim()) {
      e.preventDefault()
      setInitialItems(prev => [...prev, { title: quickAddItem.trim(), priority: 'medium' }])
      setQuickAddItem('')
    }
  }

  const colorOptions = [
    { name: 'Mor', value: '#8B5CF6' },
    { name: 'Turuncu', value: '#F97316' },
    { name: 'Mavi', value: '#3B82F6' },
    { name: 'Yeşil', value: '#10B981' },
    { name: 'Turuncu', value: '#F59E0B' },
    { name: 'Kırmızı', value: '#EF4444' },
    { name: 'İndigo', value: '#6366F1' },
    { name: 'Turkuaz', value: '#14B8A6' },
  ]



  const handleTemplateSelect = (template: TodoListTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      title: template.name,
      description: template.description,
      colorCode: template.color,
      isShared: true
    })
    setInitialItems(template.items.map(item => ({ title: item, priority: 'medium' })))
    setCurrentStep('form')
  }

  const handleCustomCreate = () => {
    setSelectedTemplate(null)
    setFormData({
      title: '',
      description: '',
      colorCode: '#8B5CF6',
      isShared: true
    })
    setInitialItems([]) // Empty list for create from scratch
    setCurrentStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Lütfen bir liste başlığı girin')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Step 1: Create the todo list with colorCode
      const todoListData: CreateTodoListRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        isShared: formData.isShared,
        colorCode: formData.colorCode
      }

      const newList = await api.createTodoList(todoListData)

      // Step 2: Add initial items if any
      if (initialItems.length > 0) {

        // Priority mapping for items
        const priorityToSeverity = (priority: string): number => {
          switch (priority) {
            case 'high': return 2
            case 'medium': return 1
            case 'low': return 0
            default: return 1
          }
        }

        // Add each initial item
        const itemPromises = initialItems
          .filter(item => item.title.trim()) // Filter out empty items
          .map((item) =>
            api.createTodoItem(newList.id, {
              title: item.title.trim(),
              severity: priorityToSeverity(item.priority) // Use list priority as default for items
            })
          )

        await Promise.all(itemPromises)
      }

      // Redirect to the new list
      router.push(`/todo-lists/${newList.id}`)
    } catch (err) {
      setError('Liste oluşturulamadı. Lütfen tekrar deneyin.')
      console.error('Create todo list error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }



  const removeInitialItem = (index: number) => {
    setInitialItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateInitialItem = (index: number, value: string) => {
    setInitialItems(prev => prev.map((item, i) => i === index ? { ...item, title: value } : item))
  }

  const updateInitialItemPriority = (index: number, priority: 'low' | 'medium' | 'high') => {
    setInitialItems(prev => prev.map((item, i) => i === index ? { ...item, priority } : item))
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

  return (
    <AppLayout>
      <div className="w-full space-y-6 max-w-5xl mx-auto px-4 sm:px-0">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          <div className={`flex items-center space-x-2 ${currentStep === 'template' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'template' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium hidden sm:block">Şablon Seçin</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300">
            <div className={`h-full bg-purple-600 transition-all duration-300 ${currentStep === 'form' ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center space-x-2 ${currentStep === 'form' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'form' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium hidden sm:block">Liste Oluşturun</span>
          </div>
        </div>

        {currentStep === 'template' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center px-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Yeni Todo Listesi Oluşturun</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Hızlı bir şablon seçin veya tamamen özelleştirin
              </p>
            </div>



            {/* Templates */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 px-1">
                📋 Hızlı Başlatma Şablonları
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                        <div
                          className="p-1.5 sm:p-2 rounded-lg"
                          style={{ backgroundColor: template.color + '20' }}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                        <div
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                          style={{ backgroundColor: template.color }}
                        />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {template.items.length} öğe
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Custom option */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={handleCustomCreate}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-3 text-left">
                    <div className="p-2 bg-gray-100 group-hover:bg-purple-100 rounded-lg transition-colors">
                      <PlusIcon className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        Tamamen Özelleştirin
                      </h3>
                      <p className="text-sm text-gray-600">
                        Boş bir listeyle başladın ve her şeyi özelleştirin
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'form' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 px-1 sm:px-2 min-w-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                  {selectedTemplate ? `Özelleştirin ${selectedTemplate.name}` : 'Özelleştirilmiş Liste Oluşturun'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 break-words">
                  Liste ayarlarınızı yapın ve başlangıç öğelerini ekleyin
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep('template')}
                size="sm"
                className="w-full mt-2 sm:mt-0 sm:w-auto h-9 text-xs"
              >
                ← Şablonlara Dön
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Basic Info */}
                <div className="space-y-6">
                  <Input
                    label="Liste Başlığı"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Örnek: Haftalık Planlar, Market Alışverişi..."
                    required
                    className="text-base sm:text-lg"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Kısa bir açıklama ekleyin..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Initial Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-900">
                      Başlangıç Öğeleri ({initialItems.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setInitialItems(prev => [...prev, { title: '', priority: 'medium' }])}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      + Öğe Ekle
                    </button>
                  </div>

                  {/* Quick Add Item */}
                  <div className="w-full">
                    <input
                      type="text"
                      value={quickAddItem}
                      onChange={(e) => setQuickAddItem(e.target.value)}
                      onKeyDown={handleQuickAddItem}
                      placeholder="Yeni öğe ekle (Enter tuşuna basarak ekle)"
                      className="w-full mb-1 mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Items List */}
                  {initialItems.length > 0 && (
                    <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-3 sm:p-3 overflow-hidden">
                      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5 sm:pr-1">
                        {initialItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-1.5 sm:gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateInitialItem(index, e.target.value)}
                              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Görev girin..."
                            />
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <PriorityDropdown
                                value={item.priority}
                                onChange={(priority) => updateInitialItemPriority(index, priority)}
                                className="w-auto h-7 sm:h-8"
                                compact={true}
                              />
                              <button
                                type="button"
                                onClick={() => removeInitialItem(index)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                title="Sil"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Liste Rengi
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, colorCode: color.value }))}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${formData.colorCode === color.value
                          ? 'border-gray-400 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div
                          className="w-full h-6 rounded-lg"
                          style={{ backgroundColor: color.value }}
                        />
                        <p className="text-[10px] sm:text-xs font-medium text-gray-700 mt-1 text-center truncate px-0.5">
                          {color.name}
                        </p>
                        {formData.colorCode === color.value && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-purple-600 rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sharing Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Paylaşım Ayarları
                  </label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Ortakla Paylaşın</h3>
                      <p className="text-sm text-gray-600">Ortakınızın bu listenin görüntülenmesine ve düzenlenmesine izin verin</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isShared: !prev.isShared }))}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${formData.isShared ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${formData.isShared ? 'translate-x-6' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Önizleme</h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: formData.colorCode }}
                        />
                        <h4 className="font-semibold text-gray-900 truncate">
                          {formData.title || 'Liste Başlığı'}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        {formData.isShared && user?.partner && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                            Paylaşılmış
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {formData.description || 'Liste açıklamanız buraya gelecek...'}
                    </p>
                    {initialItems.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {initialItems.length} başlangıç öğe eklenecek
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('template')}
                    className="sm:hidden w-full order-3"
                    size="md"
                    type="button"
                  >
                    ← Şablonlara Dön
                  </Button>
                  <Link href="/todo-lists" className="w-full sm:flex-1 order-2 sm:order-1">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full"
                      type="button"
                    >
                      İptal Et
                    </Button>
                  </Link>
                  <Button
                    variant="gradient"
                    size="md"
                    className="w-full sm:flex-1 flex items-center justify-center space-x-2 order-1 sm:order-2"
                    type="submit"
                    disabled={!formData.title.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <ListIcon className="h-5 w-5" />
                        <span>Liste Oluştur</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
} 
