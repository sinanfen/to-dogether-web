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
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.getCurrentUser()
        setUser(currentUser)
      } catch {
        // User not logged in
      }
    }
    
    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      loadUser()
    }
  }, [])

  const login = async (data: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await api.login(data)
      const user = await api.getCurrentUser()
      setUser(user)
      router.push('/dashboard')
    } catch (error) {
      setError('Login failed')
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
      const user = await api.getCurrentUser()
      setUser(user)
      
      if (response.inviteToken) {
        router.push(`/auth/invite-success?token=${response.inviteToken}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Registration failed')
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
} 