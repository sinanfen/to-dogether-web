'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { MenuIcon } from '@/components/ui/icons'
import { useAuth } from '@/contexts/auth'
import { PageLoading } from '@/components/loading'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const target = event.target as Element
        if (!target.closest('[data-sidebar]') && !target.closest('[data-sidebar-toggle]')) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, sidebarOpen])

  // Swipe gesture support for mobile
  useEffect(() => {
    if (!isMobile) return

    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = Math.abs(endY - startY)
      
      // Horizontal swipe with minimal vertical movement
      if (Math.abs(deltaX) > 100 && deltaY < 100) {
        if (deltaX > 0 && startX < 50 && !sidebarOpen) {
          // Swipe right from left edge - open sidebar
          setSidebarOpen(true)
        } else if (deltaX < 0 && sidebarOpen) {
          // Swipe left when sidebar is open - close sidebar
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, sidebarOpen])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Show loading only on initial load, not on every auth check
  if (isLoading && !user) {
    return <PageLoading />
  }

  return (
    <div className="flex h-screen bg-gray-50 safe-area-inset">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* AppBar / Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 box-border overflow-x-hidden">
          <div className="w-full max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between rounded-lg shadow-md">
            <button
              data-sidebar-toggle
              onClick={toggleSidebar}
              className="p-3 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Toggle navigation menu"
            >
              <MenuIcon className="h-6 w-6 text-white" />
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-white drop-shadow-sm">
                To-Dogether
              </h1>
              {user?.partner && (
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" title="Partner connected" />
              )}
            </div>
            {/* User avatar on mobile */}
            {user && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2 border border-white/30"
                style={{ backgroundColor: user.colorCode || '#8B5CF6' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>
        {/* Masaüstü AppBar */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              To-Dogether
            </h1>
            {user?.partner && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Partner connected" />
            )}
          </div>
          {/* User avatar on desktop */}
          {user && (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold"
              style={{ backgroundColor: user.colorCode || '#8B5CF6' }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-auto flex flex-col items-center">
          <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 