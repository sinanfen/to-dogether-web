'use client'

import { useState } from 'react'
import { LoadingButton } from '@/components/loading'

interface TestResult {
  endpoint: string
  status: 'pending' | 'success' | 'error'
  response?: Record<string, unknown>
  error?: string
  duration?: number
}

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const endpoints = [
    { name: 'Dashboard Stats', method: 'GET', url: '/dashboard/stats' },
    { name: 'Current User', method: 'GET', url: '/users/me' },
    { name: 'My Todo Lists', method: 'GET', url: '/todolists' },
    { name: 'Partner Todo Lists', method: 'GET', url: '/todolists/partner' },
    { name: 'Partner Overview', method: 'GET', url: '/partner/overview' },
  ]

  const testEndpoint = async (endpoint: { name: string; method: string; url: string }): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        credentials: 'include',
      })
      
      const duration = Date.now() - startTime
      
      if (response.ok) {
        const data = await response.json()
        return {
          endpoint: endpoint.name,
          status: 'success',
          response: data,
          duration
        }
      } else {
        const errorText = await response.text()
        return {
          endpoint: endpoint.name,
          status: 'error',
          error: `${response.status}: ${errorText}`,
          duration
        }
      }
    } catch (error) {
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    for (const endpoint of endpoints) {
      // Update state to show pending
      setTestResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'pending'
      }])
      
      const result = await testEndpoint(endpoint)
      
      // Update with actual result
      setTestResults(prev => 
        prev.map(r => r.endpoint === endpoint.name ? result : r)
      )
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunning(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 API Integration Tests
          </h1>
          <p className="text-gray-600">
            Test all API endpoints to ensure proper integration
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Test Controls
                </h2>
                <p className="text-sm text-gray-600">
                  Run tests to verify API connectivity and authentication
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={clearResults}
                  disabled={isRunning}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Clear
                </button>
                <LoadingButton
                  isLoading={isRunning}
                  onClick={runAllTests}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Run All Tests
                </LoadingButton>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Test Results
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {testResults.map((result, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          result.status === 'success' ? 'bg-green-500' :
                          result.status === 'error' ? 'bg-red-500' :
                          'bg-yellow-500 animate-pulse'
                        }`} />
                        <span className="font-medium text-gray-900">
                          {result.endpoint}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {result.duration && (
                          <span className="text-sm text-gray-500">
                            {result.duration}ms
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === 'success' ? 'bg-green-100 text-green-800' :
                          result.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.response && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                          View Response
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📋 Test Instructions
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Make sure you are logged in before running tests</li>
              <li>• Green status indicates successful API response</li>
              <li>• Red status indicates authentication or server errors</li>
              <li>• Yellow status indicates test is in progress</li>
              <li>• Check response details for API data structure</li>
              <li>• All tests should pass if API integration is working</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 