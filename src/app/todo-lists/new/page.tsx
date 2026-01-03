'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
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
      <div className="w-full space-y-4 max-w-5xl mx-auto px-2 sm:px-4 box-border overflow-x-hidden">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
          <div className={`flex items-center space-x-1.5 ${currentStep === 'template' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentStep === 'template' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-xs sm:text-sm font-medium hidden sm:block">Şablon Seçin</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-gray-300">
            <div className={`h-full bg-purple-600 transition-all duration-300 ${currentStep === 'form' ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center space-x-1.5 ${currentStep === 'form' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentStep === 'form' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-xs sm:text-sm font-medium hidden sm:block">Liste Oluşturun</span>
          </div>
        </div>

        {currentStep === 'template' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center px-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Yeni Liste Oluşturun</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Şablon seçin veya özelleştirin
              </p>
            </div>

            {/* Templates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
                📋 Şablonlar
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <div
                          className="p-1 rounded"
                          style={{ backgroundColor: template.color + '20' }}
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </div>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: template.color }}
                        />
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                        {template.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {template.items.length} öğe
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Custom option */}
              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={handleCustomCreate}
                  className="w-full p-3 border border-dashed border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-2 text-left">
                    <div className="p-1.5 bg-gray-100 group-hover:bg-purple-100 rounded transition-colors">
                      <PlusIcon className="h-4 w-4 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        Özelleştirin
                      </h3>
                      <p className="text-xs text-gray-500">
                        Boş liste
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'form' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  {selectedTemplate ? selectedTemplate.name : 'Yeni Liste'}
                </h1>
                <p className="text-xs text-gray-500">Detayları düzenleyin</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('template')}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Geri
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Liste Başlığı</label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Örnek: Haftalık Planlar..."
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    style={{ height: '36px' }}
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Açıklama</label>
                  <input
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Kısa bir açıklama..."
                    className="w-full border border-gray-200 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    style={{ height: '36px' }}
                  />
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Başlangıç Öğeleri ({initialItems.length})</label>
                    <button
                      type="button"
                      onClick={() => setInitialItems(prev => [...prev, { title: '', priority: 'medium' }])}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      + Ekle
                    </button>
                  </div>

                  {/* Quick Add */}
                  <input
                    type="text"
                    value={quickAddItem}
                    onChange={(e) => setQuickAddItem(e.target.value)}
                    onKeyDown={handleQuickAddItem}
                    placeholder="Yeni öğe yazın ve Enter'a basın..."
                    className="w-full border border-gray-200 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    style={{ height: '36px' }}
                  />

                  {/* Items List */}
                  {initialItems.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                      {initialItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateInitialItem(index, e.target.value)}
                            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 text-sm text-gray-900 focus:outline-none focus:border-purple-400"
                            style={{ height: '32px' }}
                            placeholder="Görev..."
                          />
                          <button
                            type="button"
                            onClick={() => removeInitialItem(index)}
                            className="flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            style={{ width: '32px', height: '32px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Liste Rengi</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, colorCode: color.value }))}
                        className={`rounded-lg transition-all ${formData.colorCode === color.value
                          ? 'ring-2 ring-purple-500 ring-offset-2 scale-110'
                          : 'hover:scale-105'
                          }`}
                        style={{ width: '28px', height: '28px', backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Share Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ortak Paylaşım</p>
                    <p className="text-xs text-gray-500">Ortağınız bu listeyi görebilir</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isShared: !prev.isShared }))}
                    className={`relative rounded-full transition-colors ${formData.isShared ? 'bg-purple-500' : 'bg-gray-300'}`}
                    style={{ width: '44px', height: '24px' }}
                  >
                    <div
                      className={`absolute bg-white rounded-full shadow transition-transform ${formData.isShared ? 'translate-x-5' : 'translate-x-0.5'}`}
                      style={{ width: '20px', height: '20px', top: '2px' }}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Link href="/todo-lists" className="flex-1">
                    <button
                      type="button"
                      className="w-full border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center"
                      style={{ height: '40px' }}
                    >
                      İptal
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={!formData.title.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ height: '40px' }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <ListIcon className="w-4 h-4" />
                        <span>Liste Oluştur</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
} 
