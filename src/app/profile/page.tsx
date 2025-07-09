'use client'

import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { ColorPicker } from '@/components/ui/color-picker'
import { 
  UserIcon,
  EditIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon,
  CopyIcon,
  LogoutIcon
} from '@/components/ui/icons'
import { api } from '@/lib/api'
import type { UpdateUserProfileRequest } from '@/types/api'

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (!user) {
      router.push('/auth/login')
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
  }, [user, router])

  const generateInviteCode = async () => {
    try {
      setLoading(true)
      const response = await api.generateInviteCode()
      setInviteCode(response.inviteToken)
    } catch (err) {
      setError('Failed to generate invite code')
      console.error('Invite code generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = async () => {
    if (inviteCode) {
      try {
        await navigator.clipboard.writeText(inviteCode)
        setInviteCopied(true)
        setTimeout(() => setInviteCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('💾 Profile güncelleniyor...', formData)

      const updateData: UpdateUserProfileRequest = {
        username: formData.username,
        colorCode: formData.colorCode,
        settings: formData.settings
      }

      await api.updateUserProfile(updateData)
      console.log('✅ Profile güncellendi')
      
      // Refresh user data from server
      await refreshUser()
      setEditMode(false)
    } catch (err) {
      console.error('❌ Profile update error:', err)
      setError('Failed to update profile')
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

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30 backdrop-blur-sm transition-all duration-300"
                style={{ backgroundColor: formData.colorCode }}
              >
                {formData.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-purple-100">
                  Manage your account and preferences
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!editMode ? (
                <Button 
                  onClick={() => setEditMode(true)}
                  variant="outline" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    disabled={loading}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    disabled={loading}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>
            
            <div className="space-y-6">
              {/* User ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded-lg border">
                  {user.id}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                {editMode ? (
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full"
                  />
                ) : (
                  <div className="text-gray-900 p-3 bg-gray-50 rounded-lg border">
                    {user.username}
                  </div>
                )}
              </div>

              {/* Color Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Color
                </label>
                {editMode ? (
                  <div className="space-y-3">
                    <ColorPicker
                      value={formData.colorCode}
                      onChange={(color) => setFormData({ ...formData, colorCode: color })}
                    />
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: formData.colorCode }}
                      />
                      <span className="text-gray-900 font-mono text-sm">
                        {formData.colorCode}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: user.colorCode || '#8B5CF6' }}
                    />
                    <span className="text-gray-900 font-mono text-sm">
                      {user.colorCode || '#8B5CF6'}
                    </span>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="text-gray-900 p-3 bg-gray-50 rounded-lg border">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partner Connection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Partner Connection
              </h3>
              
              {user.partner ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: user.partner.colorCode || '#EC4899' }}
                    >
                      {user.partner.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.partner.username}</p>
                      <p className="text-sm text-gray-600">Connected Partner</p>
                    </div>
                  </div>
                  
                  {user.partner.connectionDate && (
                    <p className="text-sm text-gray-600">
                      Connected since {new Date(user.partner.connectionDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <UserIcon className="h-12 w-12 text-gray-300 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-4">No partner connected yet</p>
                    
                    {inviteCode ? (
                      <div className="space-y-3">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-sm text-purple-700 mb-2 font-medium">Share this code:</p>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                              {inviteCode}
                            </code>
                            <Button
                              onClick={copyInviteCode}
                              size="sm"
                              variant="outline"
                              className="flex-shrink-0"
                            >
                              {inviteCopied ? (
                                <CheckIcon className="h-4 w-4" />
                              ) : (
                                <CopyIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={generateInviteCode}
                        disabled={loading}
                        className="w-full"
                      >
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Generate Invite Code
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            {editMode && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.notifications}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, notifications: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={formData.settings.theme}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, theme: e.target.value as 'light' | 'dark' | 'auto' }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Actions
              </h3>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogoutIcon className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 