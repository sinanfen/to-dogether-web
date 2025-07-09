'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTodoItems, useCreateTodoItem, useUpdateTodoItem, useDeleteTodoItem } from '@/hooks/api'
import { Card, CardHeader, CardContent, Button, Input, Loading } from '@/components/ui'
import { PlusIcon, CheckIcon, TrashIcon } from '@/components/ui/icons'
import { withAuth } from '@/contexts/auth-context'
import { TodoItemSeverity, TodoItemStatus } from '@/types/api'
import Link from 'next/link'

function TodoListDetailPage() {
  const params = useParams()
  const listId = parseInt(params.id as string, 10)
  
  const { data: items, isLoading: itemsLoading } = useTodoItems(listId)
  const createItem = useCreateTodoItem()
  const updateItem = useUpdateTodoItem()
  const deleteItem = useDeleteTodoItem()
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    severity: TodoItemSeverity.Medium
  })
  const [isAdding, setIsAdding] = useState(false)

  if (itemsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.title.trim()) return
    
    try {
      await createItem.mutateAsync({
        todoListId: listId,
        data: {
          title: newItem.title,
          description: newItem.description,
          severity: newItem.severity
        }
      })
      
      setNewItem({ title: '', description: '', severity: TodoItemSeverity.Medium })
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const handleToggleComplete = async (itemId: number, currentStatus: TodoItemStatus) => {
    const item = items?.find(i => i.id === itemId)
    if (!item) return
    
    try {
      await updateItem.mutateAsync({
        todoListId: listId,
        itemId,
        data: {
          title: item.title,
          description: item.description,
          status: currentStatus === TodoItemStatus.Done ? TodoItemStatus.Pending : TodoItemStatus.Done,
          severity: item.severity,
          order: item.order
        }
      })
    } catch (error) {
      console.error('Failed to update item:', error)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await deleteItem.mutateAsync({ todoListId: listId, itemId })
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const getSeverityColor = (severity: TodoItemSeverity) => {
    switch (severity) {
      case TodoItemSeverity.High:
        return 'bg-red-100 text-red-800'
      case TodoItemSeverity.Medium:
        return 'bg-yellow-100 text-yellow-800'
      case TodoItemSeverity.Low:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityLabel = (severity: TodoItemSeverity) => {
    switch (severity) {
      case TodoItemSeverity.High:
        return 'High'
      case TodoItemSeverity.Medium:
        return 'Medium'
      case TodoItemSeverity.Low:
        return 'Low'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Item */}
        <Card className="mb-6">
          <CardHeader 
            title="Add New Task"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(!isAdding)}
              >
                {isAdding ? 'Cancel' : 'Add Task'}
              </Button>
            }
          />
          {isAdding && (
            <CardContent>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <Input
                  label="Task Title"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  required
                />
                
                <Input
                  label="Description (Optional)"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add more details..."
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="flex space-x-3">
                    {[
                      { value: TodoItemSeverity.Low, label: 'Low', color: 'green' },
                      { value: TodoItemSeverity.Medium, label: 'Medium', color: 'yellow' },
                      { value: TodoItemSeverity.High, label: 'High', color: 'red' }
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setNewItem(prev => ({ ...prev, severity: priority.value }))}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-all ${
                          newItem.severity === priority.value
                            ? `border-${priority.color}-400 bg-${priority.color}-100 text-${priority.color}-800`
                            : `border-gray-200 bg-white text-gray-600 hover:border-${priority.color}-200`
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button type="submit" isLoading={createItem.isPending}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Todo Items */}
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <Card 
                  key={item.id} 
                  className={`transition-all ${
                    item.status === TodoItemStatus.Done 
                      ? 'opacity-75 bg-gray-50' 
                      : 'bg-white hover:shadow-md'
                  }`}
                >
                                     <CardContent>
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleComplete(item.id, item.status)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          item.status === TodoItemStatus.Done
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 hover:border-primary-400'
                        }`}
                        disabled={updateItem.isPending}
                      >
                        {item.status === TodoItemStatus.Done && (
                          <CheckIcon className="h-3 w-3" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium ${
                          item.status === TodoItemStatus.Done
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className={`mt-1 text-sm ${
                            item.status === TodoItemStatus.Done
                              ? 'line-through text-gray-400'
                              : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(item.severity)}`}>
                            {getSeverityLabel(item.severity)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleteItem.isPending}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-500 mb-4">Add your first task to get started</p>
                <Button onClick={() => setIsAdding(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default withAuth(TodoListDetailPage) 