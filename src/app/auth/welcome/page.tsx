'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeartIcon, CopyIcon, CheckIcon, SparklesIcon, UsersIcon, GiftIcon } from '@/components/ui/icons'
import { useAuth } from '@/contexts/auth'

function WelcomeContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const copyToClipboard = async () => {
    if (user?.inviteToken) {
      try {
        await navigator.clipboard.writeText(user.inviteToken)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to To-Dogether! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your account has been created successfully. Now let&apos;s connect with your partner!
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
          {/* Success Message */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You&apos;re All Set! ✨
            </h2>
            <p className="text-gray-600 text-lg">
              Since you&apos;re creating a new couple, here&apos;s your invite token to share with your partner:
            </p>
          </div>

          {/* Invite Token Section */}
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <GiftIcon className="h-6 w-6 text-purple-600" />
                <label className="block text-lg font-semibold text-purple-800">
                  Your Invite Token
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <code className="flex-1 p-4 bg-white border-2 border-purple-300 rounded-lg text-purple-800 font-mono text-lg break-all shadow-inner">
                  {user.inviteToken || 'TOKEN_NOT_AVAILABLE'}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-105 shadow-lg"
                  title={copied ? 'Copied!' : 'Copy to clipboard'}
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <CopyIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <UsersIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Share with Your Partner
                </h3>
              </div>
              <p className="text-blue-700 mb-4">
                Send this token to your partner so they can join your couple when they register!
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📱 How to share:</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">1.</span>
                    <span>Copy the invite token above</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">2.</span>
                    <span>Send it to your partner via message, email, or any way you prefer</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">3.</span>
                    <span>When they register, they should toggle &quot;Do you have an invite token?&quot; and paste this token</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">4.</span>
                    <span>Once they register, you&apos;ll be connected as a couple! 💕</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Features Preview */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
              <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                🚀 What you can do together:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Create shared todo lists</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Assign tasks to each other</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Track progress together</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>See each other&apos;s activities</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <Link href="/dashboard">
              <Button variant="gradient" className="w-full text-lg py-4">
                Continue to Dashboard
              </Button>
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Don&apos;t worry, you can always find this token in your profile settings later
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WelcomeContent />
    </Suspense>
  )
} 