'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'
import { 
  ListIcon, 
  PlusIcon, 
  HomeIcon,
  ShareIcon,
  HeartIcon,
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
  category: string
  priority: 'low' | 'medium' | 'high'
  items: string[]
  color: string
}

const templates: TodoListTemplate[] = [
  {
    id: 'home-chores',
    name: 'Haftalık Ev İşleri',
    description: 'Ev işlerini organize edin ve paylaşın',
    icon: HomeIcon,
    category: 'home',
    priority: 'medium',
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
    category: 'shopping',
    priority: 'high',
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
    category: 'travel',
    priority: 'medium',
    color: '#EC4899',
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
    category: 'work',
    priority: 'high',
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
    icon: HeartIcon,
    category: 'personal',
    priority: 'medium',
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
    category: 'health',
    priority: 'medium',
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
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<'template' | 'form'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TodoListTemplate | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    colorCode: '#8B5CF6',
    category: 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isShared: true
  })
  
  const [initialItems, setInitialItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
  }, [user, router])

  const colorOptions = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
  ]

  const categoryOptions = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'other', label: 'Other', icon: '📝' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-700', icon: '🟢' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-700', icon: '🔴' }
  ]

  const handleTemplateSelect = (template: TodoListTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      title: template.name,
      description: template.description,
      colorCode: template.color,
      category: template.category,
      priority: template.priority,
      isShared: true
    })
    setInitialItems(template.items)
    setCurrentStep('form')
  }

  const handleCustomCreate = () => {
    setSelectedTemplate(null)
    setFormData({
      title: '',
      description: '',
      colorCode: '#8B5CF6',
      category: 'personal',
      priority: 'medium',
      isShared: true
    })
    setInitialItems([])
    setCurrentStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Please enter a list title')
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
          .filter(item => item.trim()) // Filter out empty items
          .map((itemTitle) => 
            api.createTodoItem(newList.id, {
              title: itemTitle.trim(),
              severity: priorityToSeverity(formData.priority) // Use list priority as default for items
            })
          )

        await Promise.all(itemPromises)
      }
      
      // Redirect to the new list
      router.push(`/todo-lists/${newList.id}`)
    } catch (err) {
      setError('Failed to create todo list. Please try again.')
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

  const addInitialItem = () => {
    setInitialItems(prev => [...prev, ''])
  }

  const updateInitialItem = (index: number, value: string) => {
    setInitialItems(prev => prev.map((item, i) => i === index ? value : item))
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${currentStep === 'template' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'template' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium hidden sm:block">Choose Template</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300">
            <div className={`h-full bg-purple-600 transition-all duration-300 ${currentStep === 'form' ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center space-x-2 ${currentStep === 'form' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'form' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium hidden sm:block">Create List</span>
          </div>
        </div>

        {currentStep === 'template' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Todo List</h1>
              <p className="text-gray-600">
                Choose a template to get started quickly, or create from scratch
              </p>
            </div>

            {/* Templates */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Quick Start Templates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: template.color + '20' }}
                        >
                                                     <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.color }}
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {template.items.length} items
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${priorityOptions.find(p => p.value === template.priority)?.color}`}>
                            {priorityOptions.find(p => p.value === template.priority)?.icon}
                          </span>
                        </div>
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
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-2 bg-gray-100 group-hover:bg-purple-100 rounded-lg transition-colors">
                      <PlusIcon className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        Create from Scratch
                      </h3>
                      <p className="text-sm text-gray-600">
                        Start with a blank list and customize everything
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedTemplate ? `Customize ${selectedTemplate.name}` : 'Create Custom List'}
                </h1>
                <p className="text-gray-600">
                  Configure your todo list settings and add initial items
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentStep('template')}
                className="hidden sm:flex"
              >
                ← Back to Templates
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="List Title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Weekend Plans, Grocery Shopping..."
                      required
                      className="text-lg"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Add a brief description..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {categoryOptions.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {priorityOptions.map(priority => (
                          <button
                            key={priority.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as 'low' | 'medium' | 'high' }))}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                              formData.priority === priority.value
                                ? 'border-purple-400 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`text-xs p-1 rounded ${priority.color}`}>
                              {priority.icon} {priority.label.split(' ')[0]}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    List Color
                  </label>
                  <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, colorCode: color.value }))}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.colorCode === color.value
                            ? 'border-gray-400 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-full h-6 rounded-lg"
                          style={{ backgroundColor: color.value }}
                        />
                        <p className="text-xs font-medium text-gray-700 mt-1 text-center">
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
                    Sharing Settings
                  </label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Share with Partner</h3>
                      <p className="text-sm text-gray-600">Allow your partner to view and edit this list</p>
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
                </div>

                {/* Initial Items */}
                {initialItems.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Initial Items ({initialItems.length})
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {initialItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateInitialItem(index, e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter task..."
                          />
                          <button
                            type="button"
                            onClick={() => removeInitialItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInitialItem}
                        className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                      >
                        + Add Another Item
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: formData.colorCode }}
                        />
                        <h4 className="font-semibold text-gray-900">
                          {formData.title || 'Your List Title'}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${priorityOptions.find(p => p.value === formData.priority)?.color}`}>
                          {priorityOptions.find(p => p.value === formData.priority)?.icon}
                        </span>
                        {formData.isShared && user.partner && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {formData.description || 'Your list description will appear here...'}
                    </p>
                    {initialItems.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {initialItems.length} initial item{initialItems.length !== 1 ? 's' : ''} will be added
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('template')}
                    className="sm:hidden"
                    type="button"
                  >
                    ← Back to Templates
                  </Button>
                  <Link href="/todo-lists" className="flex-1">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      type="button"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    className="flex-1 flex items-center justify-center space-x-2"
                    type="submit"
                    disabled={!formData.title.trim() || isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ListIcon className="h-5 w-5" />
                        <span>Create List</span>
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