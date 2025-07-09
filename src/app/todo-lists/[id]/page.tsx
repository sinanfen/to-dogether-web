'use client'

import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import Link from 'next/link'

export default function TodoListDetailPage() {
  const params = useParams()
  const listId = params.id as string

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/todo-lists">
            <Button variant="ghost" size="sm">
              ← Back to Lists
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Todo List #{listId}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚧 Under Development
          </h2>
          <p className="text-gray-600 mb-6">
            This todo list detail page is currently being developed. 
            The functionality will be available soon.
          </p>
          <Link href="/todo-lists">
            <Button variant="gradient">
              Back to Todo Lists
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
} 