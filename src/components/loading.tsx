import React from 'react'

// ========================================
// 🔄 LOADING SPINNER
// ========================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'gray'
  className?: string
}

export function LoadingSpinner({ size = 'md', color = 'blue', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }

  return (
    <div 
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}
      aria-label="Loading..."
    />
  )
}

// ========================================
// 📄 PAGE LOADING
// ========================================

export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// ========================================
// 📋 CARD LOADING SKELETON
// ========================================

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

// ========================================
// 📊 STATS CARD SKELETON
// ========================================

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

// ========================================
// 📝 LIST ITEM SKELETON
// ========================================

export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-16 h-2 bg-gray-200 rounded"></div>
        <div className="w-8 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

// ========================================
// 🔄 BUTTON LOADING STATE
// ========================================

interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({ 
  isLoading, 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center space-x-2 transition-opacity ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading && <LoadingSpinner size="sm" color="white" />}
      <span>{children}</span>
    </button>
  )
}

// ========================================
// 📱 MOBILE LOADING OVERLAY
// ========================================

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 text-center min-w-[200px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  )
} 