'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'
import { ListIcon, PlusIcon } from '@/components/ui/icons'
import Link from 'next/link'

export default function NewTodoListPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#8B5CF6'
  })
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: API call to create todo list
      console.log('Creating todo list:', formData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to todo lists page
      router.push('/todo-lists')
    } catch (error) {
      console.error('Failed to create todo list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New List</h1>
          <p className="text-gray-600">
            Start organizing your tasks with a new todo list
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
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
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add a brief description of what this list is for..."
                rows={3}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Choose a Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      formData.color === color.value
                        ? 'border-gray-400 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-full h-8 rounded-lg"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-xs font-medium text-gray-700 mt-2 text-center">
                      {color.name}
                    </p>
                    {formData.color === color.value && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-purple-600 rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <h4 className="font-semibold text-gray-900">
                    {formData.title || 'Your List Title'}
                  </h4>
                </div>
                <p className="text-gray-600 text-sm">
                  {formData.description || 'Your list description will appear here...'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
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

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use descriptive titles to easily identify your lists</li>
            <li>• Choose colors that make sense for different categories</li>
            <li>• Your partner will be able to see and collaborate on your lists</li>
            <li>• You can always edit the title, description, and color later</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  )
} 