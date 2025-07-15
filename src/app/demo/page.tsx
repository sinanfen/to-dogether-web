'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeartIcon, UsersIcon, CheckIcon } from '@/components/ui/icons'

export default function DemoPage() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Hafta sonu kaçamağımızı planla', completed: false, priority: 'high', assignedTo: 'both' },
    { id: 2, text: 'Akşam yemeği için market alışverişi yap', completed: true, priority: 'medium', assignedTo: 'you' },
    { id: 3, text: 'Yıldönümü için restoran rezervasyonu yap', completed: false, priority: 'high', assignedTo: 'partner' },
    { id: 4, text: 'Oturma odasını temizle', completed: false, priority: 'low', assignedTo: 'you' },
    { id: 5, text: 'Birlikte film izle', completed: true, priority: 'medium', assignedTo: 'both' },
  ])

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getAssignedColor = (assignedTo: string) => {
    switch (assignedTo) {
      case 'you': return 'text-blue-600 bg-blue-50'
      case 'partner': return 'text-purple-600 bg-purple-50'
      case 'both': return 'text-pink-600 bg-pink-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'yüksek'
      case 'medium': return 'orta'
      case 'low': return 'düşük'
      default: return priority
    }
  }

  const getAssignedText = (assignedTo: string) => {
    switch (assignedTo) {
      case 'you': return 'sen'
      case 'partner': return 'partner'
      case 'both': return 'ikimiz'
      default: return assignedTo
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-6 cursor-pointer hover:bg-gray-50"
          >
            ← Ana Sayfaya Dön
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <HeartIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              To-Dogether Demo
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Çiftlerin nasıl birlikte plan yapabileceğini interaktif demomuzla deneyimleyin. 
            Görevleri işaretlemeyi deneyin ve gerçek zamanlı işbirliğini canlı olarak görün!
          </p>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Todo List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Hafta Sonu Planlarımız</h2>
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Paylaşılan Liste</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 ${
                      todo.completed 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-purple-500'
                      }`}
                    >
                      {todo.completed && <CheckIcon className="h-4 w-4 text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium transition-all duration-200 ${
                        todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {todo.text}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
                        {getPriorityText(todo.priority)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAssignedColor(todo.assignedTo)}`}>
                        {getAssignedText(todo.assignedTo)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partner Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Genel Bakış</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Sen</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alex</p>
                    <p className="text-sm text-gray-600">Bugün 2 görev tamamlandı</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">❤️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Jordan</p>
                    <p className="text-sm text-gray-600">Bugün 1 görev tamamlandı</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bugün Tamamlanan</span>
                  <span className="font-semibold text-green-600">
                    {todos.filter(t => t.completed).length}/{todos.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yüksek Öncelik</span>
                  <span className="font-semibold text-red-600">
                    {todos.filter(t => t.priority === 'high' && !t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paylaşılan Görevler</span>
                  <span className="font-semibold text-purple-600">
                    {todos.filter(t => t.assignedTo === 'both').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Birlikte Planlamaya Hazır mısınız?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            To-Dogether ile hayatlarını birlikte planlayan binlerce çiftin arasına katılın.
            Hesabınızı oluşturun ve bugün işbirliği yapmaya başlayın!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button variant="gradient" size="lg" className="px-8 py-3">
                Şimdi Kayıt Ol
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 