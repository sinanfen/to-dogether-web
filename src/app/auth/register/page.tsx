'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth'
import { Input, ColorPicker } from '@/components/ui'
import { UsersIcon } from '@/components/ui/icons'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [colorCode, setColorCode] = useState('#8B5CF6') // Purple default
  const [hasInviteToken, setHasInviteToken] = useState(false)
  const [inviteToken, setInviteToken] = useState('')

  const { register, isLoading, error, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Auth Guard: Eğer zaten login olmuşsa dashboard'a yönlendir
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Loading state
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register({
      username,
      password,
      colorCode,
      inviteToken: hasInviteToken ? inviteToken : undefined
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-3 sm:mb-4 cursor-pointer transition-transform duration-200">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl">
              <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              To-Dogether
            </h1>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">To-Dogether&apos;a Katıl</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Hesabınızı oluşturun ve birlikte planlamaya başlayın</p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6 bg-white p-4 sm:p-8 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4 sm:space-y-6">
            <Input
              label="Kullanıcı Adı"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Bir kullanıcı adı seçin"
              required
              autoComplete="username"
              className="transition-all duration-300"
            />

            <Input
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Bir şifre oluşturun"
              required
              showPasswordToggle={true}
              autoComplete="new-password"
              className="transition-all duration-300"
            />

            <ColorPicker
              label="Renk Seçiniz"
              value={colorCode}
              onChange={setColorCode}
              className="transition-all duration-300"
            />

            {/* Invite Token Section */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <div className="mb-3 sm:mb-4">
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
                    <input
                      type="checkbox"
                      id="hasInviteToken"
                      checked={hasInviteToken}
                      onChange={(e) => setHasInviteToken(e.target.checked)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="hasInviteToken"
                      className={`flex items-center justify-center w-6 h-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${hasInviteToken
                        ? 'bg-gradient-to-r from-purple-500 to-orange-500 border-purple-500 shadow-lg'
                        : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                    >
                      {hasInviteToken && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  </div>
                  <label htmlFor="hasInviteToken" className="text-sm font-medium text-gray-700 cursor-pointer leading-tight">
                    Takım arkadaşınızdan bir davet kodunuz var mı?
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-9">
                  Bir davet kodu aldıysanız işaretleyin
                </p>
              </div>

              {hasInviteToken && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <Input
                    label="Davet Kodu"
                    type="text"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    placeholder="Davet kodunu girin"
                    className="transition-all duration-300"
                  />
                  <p className="mt-2 text-xs text-purple-600">
                    💡 Takım arkadaşınız hesabını oluşturduktan sonra bu kodu sizinle paylaşmalı
                  </p>
                </div>
              )}

              {!hasInviteToken && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Yeni bir takım mı oluşturuyorsunuz?</strong><br />
                    Kayıt olduktan sonra arkadaşlarınızla paylaşmak için bir davet kodu alacaksınız!
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl min-h-[48px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten bir hesabınız var mı?{' '}
              <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                Buradan giriş yapın
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 
