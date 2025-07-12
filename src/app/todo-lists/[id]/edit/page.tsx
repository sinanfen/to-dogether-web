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
    category: 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isShared: true
  })

  const [useCustomColor, setUseCustomColor] = useState(false)

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
        setError('Todo list not found')
        return
      }

      // Check if user owns this list OR if the list is shared
      if (list.ownerId !== user?.id && !list.isShared) {
        setError('You can only edit your own lists or shared lists')
        return
      }

      setFormData({
        title: list.title,
        description: list.description || '',
        colorCode: list.colorCode || '#8B5CF6',
        category: list.category || 'personal',
        priority: list.priority || 'medium',
        isShared: list.isShared
      })
    } catch (err) {
      console.error('❌ Todo list loading error:', err)
      setError('Failed to load todo list')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Please enter a list title')
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
      setError('Failed to update todo list. Please try again.')
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
          <p className="text-gray-600">Loading...</p>
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
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <div className="flex items-center justify-center space-x-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Retry
                </Button>
                <Link href="/todo-lists">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Back to Lists
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
              <span>Back to List</span>
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ListIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Todo List</h1>
              <p className="text-gray-600">Update your list settings and information</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter list title..."
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description for your list..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Appearance
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Color
                </label>
                
                {/* Custom Color Switch */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Custom Color</h3>
                    <p className="text-xs text-gray-600">Use custom color picker instead of presets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseCustomColor(!useCustomColor)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                      useCustomColor ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div 
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        useCustomColor ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Custom Color Picker */}
                {useCustomColor && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Color
                    </label>
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

                {/* Preset Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preset Colors
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, colorCode: color.value }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.colorCode === color.value
                            ? 'border-gray-400 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg mx-auto mb-2"
                          style={{ backgroundColor: color.value }}
                        />
                        <p className="text-xs font-medium text-gray-700">{color.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.category === category.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{category.icon}</div>
                      <p className="text-xs font-medium">{category.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="space-y-2">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as 'low' | 'medium' | 'high' }))}
                      className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                        formData.priority === priority.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{priority.icon}</span>
                        <span className="font-medium text-gray-900">{priority.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sharing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Sharing Settings
              </h2>
              
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

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href={`/todo-lists/${listId}`}>
                <Button 
                  variant="outline"
                  className="px-6"
                >
                  Cancel
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
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <SaveIcon className="w-4 h-4" />
                    <span>Save Changes</span>
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