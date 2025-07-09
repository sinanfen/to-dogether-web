'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
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

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/todo-lists', label: 'Todo Lists', icon: ListIcon },
  { href: '/partner', label: 'Partner Overview', icon: UsersIcon },
  { href: '/profile', label: 'Profile', icon: SettingsIcon },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
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
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close mobile sidebar on navigation
                      if (window.innerWidth < 1024) {
                        onToggle()
                      }
                    }}
                    className={clsx(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                      isActive 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                    )}
                  >
                    <Icon className={clsx(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'
                    )} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4">
          {user && (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: user.colorCode || '#8B5CF6' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.username}</p>
                <p className="text-sm text-gray-500">Your Color</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogoutIcon className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
} 