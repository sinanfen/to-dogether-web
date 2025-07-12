'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, LoginRequest, RegisterRequest } from '@/types/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Başlangıçta loading true
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)
        
        // Paralel olarak user ve partner bilgilerini yükle
        const [currentUser, partnerOverview] = await Promise.allSettled([
          api.getCurrentUser(),
          api.getPartnerOverview()
        ])
        
        if (currentUser.status === 'fulfilled') {
          if (partnerOverview.status === 'fulfilled') {
            // Add partner to user object
            const userWithPartner = {
              ...currentUser.value,
              partner: {
                id: partnerOverview.value.id,
                username: partnerOverview.value.username,
                colorCode: partnerOverview.value.colorCode,
                avatar: undefined,
                createdAt: partnerOverview.value.createdAt,
                updatedAt: partnerOverview.value.createdAt,
                isConnected: true,
                connectionDate: partnerOverview.value.createdAt
              }
            }
            
            setUser(userWithPartner)
          } else {
            // Set user without partner
            setUser(currentUser.value)
          }
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    if (token) {
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser()
      
      // Try to load partner information separately
      try {
        const partnerOverview = await api.getPartnerOverview()
        
        // Add partner to user object
        const userWithPartner = {
          ...currentUser,
          partner: {
            id: partnerOverview.id,
            username: partnerOverview.username,
            colorCode: partnerOverview.colorCode,
            avatar: undefined,
            createdAt: partnerOverview.createdAt,
            updatedAt: partnerOverview.createdAt,
            isConnected: true,
            connectionDate: partnerOverview.createdAt
          }
        }
        
        setUser(userWithPartner)
      } catch {
        // Set user without partner
        setUser(currentUser)
      }
    } catch {
      setUser(null)
    }
  }

  const login = async (data: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await api.login(data)
      
      // Login başarılı olduktan sonra gerçek user bilgisini yükle
      const currentUser = await api.getCurrentUser()
      
      // Try to load partner information separately
      try {
        const partnerOverview = await api.getPartnerOverview()
        
        // Add partner to user object
        const userWithPartner = {
          ...currentUser,
          partner: {
            id: partnerOverview.id,
            username: partnerOverview.username,
            colorCode: partnerOverview.colorCode,
            avatar: undefined,
            createdAt: partnerOverview.createdAt,
            updatedAt: partnerOverview.createdAt,
            isConnected: true,
            connectionDate: partnerOverview.createdAt
          }
        }
        
        setUser(userWithPartner)
      } catch {
        // Set user without partner
        setUser(currentUser)
      }
      router.push('/dashboard')
    } catch (error) {
      setError('Login failed. Please check your credentials.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.register(data)
      
      // Register başarılı olduktan sonra gerçek user bilgisini yükle
      const currentUser = await api.getCurrentUser()
      
      // Try to load partner information separately
      try {
        const partnerOverview = await api.getPartnerOverview()
        
        // Add partner to user object
        const userWithPartner = {
          ...currentUser,
          partner: {
            id: partnerOverview.id,
            username: partnerOverview.username,
            colorCode: partnerOverview.colorCode,
            avatar: undefined,
            createdAt: partnerOverview.createdAt,
            updatedAt: partnerOverview.createdAt,
            isConnected: true,
            connectionDate: partnerOverview.createdAt
          }
        }
        
        setUser(userWithPartner)
      } catch {
        // Set user without partner
        setUser(currentUser)
      }
      
      // Eğer invite token varsa invite-success sayfasına, yoksa welcome sayfasına yönlendir
      if (response.inviteToken) {
        router.push(`/auth/invite-success?token=${response.inviteToken}`)
      } else {
        router.push('/auth/welcome')
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    
    try {
      await api.logout()
      setUser(null)
      router.push('/auth/login')
    } catch {
      // Force logout locally even if API call fails
      setUser(null)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 