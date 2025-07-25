'use client'

import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Input, Modal } from '@/components/ui'
import { ColorPicker } from '@/components/ui/color-picker'
import { 
  UserIcon,
  EditIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon,
  ClipboardIcon
} from '@/components/ui/icons'
import { api } from '@/lib/api'
import type { UpdateUserProfileRequest } from '@/types/api'

export default function ProfilePage() {
  const { user, refreshUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalToken, setModalToken] = useState<string | null>(null)
  const [modalCopied, setModalCopied] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  // Edit form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    colorCode: user?.colorCode || '#8B5CF6',
    settings: {
      notifications: true,
      theme: 'light' as 'light' | 'dark' | 'auto',
      language: 'en',
      timezone: 'UTC'
    }
  })

  useEffect(() => {
    // Only redirect to login if user is not authenticated and auth loading is complete
    if (!user && !authLoading) {
      router.push('/auth/login')
      return
    }

    // Don't update form data if user is not authenticated yet
    if (!user) {
      return
    }

    // Update form data when user changes
    setFormData({
      username: user.username,
      colorCode: user.colorCode || '#8B5CF6',
      settings: user.settings || {
        notifications: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC'
      }
    })
  }, [user, router, authLoading])

  const showInviteCode = async () => {
    try {
      setModalLoading(true)
      setError(null)
      
      // API'den invite token'ı al
      const response = await api.getCoupleInviteToken()
      setModalToken(response.inviteToken)
      setIsModalOpen(true)
      setModalCopied(false) // Reset copy state
    } catch (err) {
      setError('Davet kodu alınamadı')
      console.error('Invite code error:', err)
    } finally {
      setModalLoading(false)
    }
  }

  const copyModalToken = async () => {
    if (modalToken) {
      try {
        await navigator.clipboard.writeText(modalToken)
        setModalCopied(true)
        setTimeout(() => setModalCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const updateData: UpdateUserProfileRequest = {
        username: formData.username,
        colorCode: formData.colorCode,
        settings: formData.settings
      }

      await api.updateUserProfile(updateData)
      
      // Refresh user data from server
      await refreshUser()
      setEditMode(false)
    } catch (err) {
      console.error('❌ Profile update error:', err)
      setError('Profil güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form to original values
    setFormData({
      username: user?.username || '',
      colorCode: user?.colorCode || '#8B5CF6',
      settings: user?.settings || {
        notifications: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC'
      }
    })
    setEditMode(false)
    setError(null)
  }



  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null // Will be redirected by useEffect
  }

    return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Top Header - Full Width */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* 1. Satır: Avatar, İsim, Açıklama */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <div className="flex items-center justify-center mb-4 sm:mb-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg bg-center bg-cover"
                style={{ backgroundColor: formData.colorCode }}
              >
                {formData.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-start">
              <h1 className="text-2xl font-bold text-gray-900">{formData.username}</h1>
              <p className="text-gray-600">
                {user.partner ? `Partner: ${user.partner.username}` : 'Tek kullanıcı'}
              </p>
            </div>
          </div>
          {/* 2. Satır: Butonlar */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {!editMode ? (
              <Button 
                variant="outline"
                onClick={() => setEditMode(true)}
                size="sm"
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Profili Düzenle
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={handleCancelEdit}
                  size="sm"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  İptal Et
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  size="sm"
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Değişiklikleri Kaydet
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 overflow-x-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
            <UserIcon className="h-6 w-6 mr-3 text-purple-600" />
            Profil Ayarları
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Username Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Kullanıcı Adı
              </label>
              {editMode ? (
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 font-medium text-lg">{formData.username}</p>
                </div>
              )}
            </div>

            {/* Color Code Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profil Rengi
              </label>
              {editMode ? (
                <ColorPicker
                  value={formData.colorCode}
                  onChange={(color) => setFormData({ ...formData, colorCode: color })}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: formData.colorCode }}
                    />
                    <span className="text-gray-900 font-medium text-lg">{formData.colorCode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Small Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
              Partner
            </h3>
            
            {user.partner ? (
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                  style={{ backgroundColor: user.partner.colorCode }}
                >
                  {user.partner.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.partner.username}</p>
                  <p className="text-xs text-gray-600">Connected</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">No partner</p>
                <p className="text-xs text-gray-500">Invite someone</p>
              </div>
            )}
          </div>

          {/* Invite Token Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShareIcon className="h-5 w-5 mr-2 text-purple-600" />
              Davet Kodu
            </h3>
            
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Davet kodunu arkadaşlarınla paylaş.
              </p>
              
              <Button
                onClick={showInviteCode}
                disabled={modalLoading}
                size="sm"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {modalLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShareIcon className="h-4 w-4 mr-2" />
                )}
                Kodu Al
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Code Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Davet Kodunuz"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              Bu kodu arkadaşlarınla paylaş, böylece seninle ve partnerinle eşleşebilirler:
            </p>
          </div>
          
          {modalToken && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="text-center space-y-4">
                <code className="block text-xl font-mono text-purple-700 break-all bg-white p-4 rounded-lg shadow-inner">
                  {modalToken}
                </code>
                <Button
                  onClick={copyModalToken}
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-3 py-2 w-full max-w-xs mx-auto text-sm"
                >
                  <ClipboardIcon className="h-5 w-5 flex-shrink-0 stroke-current" />
                  <span className="font-semibold">{modalCopied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                </Button>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              📱 Nasıl paylaşılır:
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Yukarıdaki kodu kopyala</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Kodu arkadaşlarına gönder</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Kayıt olurken bu kodu kullanabilirler</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
} 