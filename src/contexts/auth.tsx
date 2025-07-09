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
        console.log('🔄 User loading başladı...')
        setIsLoading(true)
        const currentUser = await api.getCurrentUser()
        console.log('✅ User loaded:', currentUser)
        
        // Try to load partner information separately
        try {
          const partnerOverview = await api.getPartnerOverview()
          console.log('✅ Partner bilgisi yüklendi:', partnerOverview)
          
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
        } catch (partnerError) {
          console.log('👤 No partner found or partner loading failed:', partnerError)
          // Set user without partner
          setUser(currentUser)
        }
      } catch (error) {
        console.log('❌ User load failed:', error)
        // User not logged in or token expired
        setUser(null)
      } finally {
        console.log('🏁 User loading bitti')
        setIsLoading(false)
      }
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    console.log('🔑 Token check:', { token: token ? 'var' : 'yok' })
    
    if (token) {
      loadUser()
    } else {
      console.log('🚫 Token yok, loading false')
      setIsLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser()
      
      // Try to load partner information separately
      try {
        const partnerOverview = await api.getPartnerOverview()
        console.log('✅ Partner bilgisi yüklendi:', partnerOverview)
        
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
      } catch (partnerError) {
        console.log('👤 No partner found or partner loading failed:', partnerError)
        // Set user without partner
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }

  const login = async (data: LoginRequest) => {
    console.log('🔐 Login başlatıldı:', data.username)
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.login(data)
      console.log('✅ API Login başarılı:', response)
      
      // Login başarılı olduktan sonra gerçek user bilgisini yükle
      const currentUser = await api.getCurrentUser()
      console.log('👤 User bilgisi yüklendi:', currentUser)
      
      // Try to load partner information separately
      try {
        const partnerOverview = await api.getPartnerOverview()
        console.log('✅ Partner bilgisi yüklendi:', partnerOverview)
        
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
      } catch (partnerError) {
        console.log('👤 No partner found or partner loading failed:', partnerError)
        // Set user without partner
        setUser(currentUser)
      }
      console.log('🔗 Dashboard\'a yönlendiriliyor...')
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Login hatası:', error)
      setError('Login failed. Please check your credentials.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    console.log('📝 Register başlatıldı:', data.username)
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.register(data)
      console.log('✅ API Register başarılı:', response)
      
      // Register başarılı olduktan sonra gerçek user bilgisini yükle
      const currentUser = await api.getCurrentUser()
      console.log('👤 User bilgisi yüklendi:', currentUser)
      
      // Try to load partner information separately
      try {
        const partnerOverview = await api.getPartnerOverview()
        console.log('✅ Partner bilgisi yüklendi:', partnerOverview)
        
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
      } catch (partnerError) {
        console.log('👤 No partner found or partner loading failed:', partnerError)
        // Set user without partner
        setUser(currentUser)
      }
      
      if (response.inviteToken) {
        console.log('🔗 Invite success sayfasına yönlendiriliyor...')
        router.push(`/auth/invite-success?token=${response.inviteToken}`)
      } else {
        console.log('🔗 Dashboard\'a yönlendiriliyor...')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ Register hatası:', error)
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
    } catch (error) {
      console.error('Logout failed:', error)
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