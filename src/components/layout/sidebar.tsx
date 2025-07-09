'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth'
import { 
  HomeIcon, 
  ListIcon, 
  UsersIcon, 
  SettingsIcon, 
  LogoutIcon, 
  HeartIcon,
  XMarkIcon
} from '@/components/ui/icons'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/todo-lists', label: 'Todo Lists', icon: ListIcon },
    { 
      href: '/partner', 
      label: 'Partner', 
      icon: UsersIcon,
      badge: user?.partner ? '✓' : '!'
    },
    { href: '/profile', label: 'Profile', icon: SettingsIcon },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (isMobile) {
      onToggle()
    }
  }

  return (
    <>
      {/* Mobile backdrop with blur */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40 transition-opacity duration-300"
          onClick={onToggle}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      )}
      
      {/* Sidebar */}
      <div 
        data-sidebar
        className={clsx(
          'fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50',
          'lg:w-64 lg:shadow-xl lg:relative lg:translate-x-0 lg:z-auto',
          'border-r border-gray-200',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ 
          maxWidth: '85vw',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingTop: 'env(safe-area-inset-top)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <HeartIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                To-Dogether
              </h1>
              {user && (
                <p className="text-sm text-gray-500">Welcome, {user.username}</p>
              )}
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-3 rounded-xl hover:bg-white/50 active:bg-white/70 transition-colors touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User section at top */}
        {user && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-sm">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                style={{ backgroundColor: user.colorCode || '#8B5CF6' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">Your Profile</p>
                  {user.partner && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={clsx(
                      'flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 group touch-manipulation',
                      'hover:scale-[1.02] active:scale-[0.98]',
                      isActive 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-lg border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600 hover:shadow-md'
                    )}
                    style={{ minHeight: '56px' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={clsx(
                        'h-6 w-6 transition-colors',
                        isActive ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'
                      )} />
                      <span className="font-medium text-base">{item.label}</span>
                    </div>
                    
                    {item.badge && (
                      <div className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        item.badge === '✓' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-orange-100 text-orange-600'
                      )}>
                        {item.badge}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Quick actions section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/todo-lists/new"
                onClick={handleNavClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] touch-manipulation"
                style={{ minHeight: '48px' }}
              >
                <ListIcon className="h-5 w-5" />
                <span className="font-medium">New Todo List</span>
              </Link>
              
              {!user?.partner && (
                <Link
                  href="/profile"
                  onClick={handleNavClick}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation"
                  style={{ minHeight: '48px' }}
                >
                  <HeartIcon className="h-5 w-5" />
                  <span className="font-medium">Connect Partner</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center space-x-3 w-full px-4 py-4 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group touch-manipulation active:scale-[0.98]"
            style={{ minHeight: '56px' }}
            aria-label="Logout from application"
          >
            {isLoggingOut ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                <span className="font-medium">Logging out...</span>
              </>
            ) : (
              <>
                <LogoutIcon className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                <span className="font-medium">Logout</span>
              </>
            )}
          </button>

          {/* Version info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              To-Dogether v1.0 • PWA Ready
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 