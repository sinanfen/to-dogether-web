'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth'
import { Input, ColorPicker } from '@/components/ui'
import { HeartIcon } from '@/components/ui/icons'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [colorCode, setColorCode] = useState('#8B5CF6') // Purple default
  const [hasInviteToken, setHasInviteToken] = useState(false)
  const [inviteToken, setInviteToken] = useState('')
  
  const { register, isLoading, error } = useAuth()

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-4 cursor-pointer hover:scale-105 transition-transform duration-200">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <HeartIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              To-Dogether
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Join To-Dogether</h2>
          <p className="mt-2 text-gray-600">Create your account and start planning together</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              autoComplete="username"
              className="transition-all duration-300 focus:scale-105"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              showPasswordToggle={true}
              autoComplete="new-password"
              className="transition-all duration-300 focus:scale-105"
            />

            <ColorPicker
              label="Choose Your Color"
              value={colorCode}
              onChange={setColorCode}
              className="transition-all duration-300"
            />

            {/* Invite Token Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="hasInviteToken"
                  checked={hasInviteToken}
                  onChange={(e) => setHasInviteToken(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="hasInviteToken" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Do you have an invite token from your partner?
                </label>
              </div>
              
              {hasInviteToken && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <Input
                    label="Invite Token"
                    type="text"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    placeholder="Enter your partner's invite token"
                    className="transition-all duration-300 focus:scale-105"
                  />
                  <p className="mt-2 text-xs text-purple-600">
                    💡 Your partner should have shared this token with you after creating their account
                  </p>
                </div>
              )}
              
              {!hasInviteToken && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Creating a new couple?</strong><br />
                    You&apos;ll receive an invite token after registration to share with your partner!
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl z-10"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 