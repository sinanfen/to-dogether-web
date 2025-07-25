'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { HeartIcon, CopyIcon, CheckIcon } from '@/components/ui/icons'

function InviteSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!inviteToken) {
      router.push('/dashboard')
    }
  }, [inviteToken, router])

  const copyToClipboard = async () => {
    if (inviteToken) {
      try {
        await navigator.clipboard.writeText(inviteToken)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  if (!inviteToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">To-Dogether&apos;a Hoş Geldiniz!</h1>
          <p className="text-gray-600">Hesabınız başarıyla oluşturuldu</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Her Şey Hazır!</h2>
            <p className="text-gray-600 text-sm">
              Yeni bir çift oluşturduğunuz için, partnerinizle paylaşmanız gereken davet kodunuz aşağıda:
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Davet Kodunuz
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-white border border-purple-300 rounded-lg text-purple-800 font-mono text-sm break-all">
                  {inviteToken}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  title={copied ? 'Kopyalandı!' : 'Kopyala'}
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📱 Partnerinizle Paylaşın</h3>
              <p className="text-sm text-blue-700 mb-3">
                Bu kodu partnerinize gönderin, böylece kayıt olurken çiftinize katılabilir!
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Kayıt sırasında &quot;Davet kodunuz var mı?&quot; seçeneğini işaretlesinler</li>
                <li>• Bu kodu davet kodu alanına yapıştırsınlar</li>
                <li>• Kayıt tamamlandığında artık çift olarak bağlısınız! 💕</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link href="/dashboard">
              <Button variant="gradient" className="w-full">
                Panele Devam Et
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Bu kodu daha sonra profil ayarlarınızda da bulabilirsiniz
          </p>
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
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    </div>
  )
}

export default function InviteSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InviteSuccessContent />
    </Suspense>
  )
} 