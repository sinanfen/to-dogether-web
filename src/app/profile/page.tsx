import { requireAuth } from '@/lib/dal'
import { getCurrentUserApi } from '@/lib/api-client-server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  // ✅ Modern DAL protection
  await requireAuth()
  
  let userProfile = null
  try {
    // ✅ Get fresh user data from API
    userProfile = await getCurrentUserApi()
  } catch (error) {
    console.error('Failed to load user profile:', error)
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          {/* Profile Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Profile Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <div className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                  {userProfile?.id}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="text-gray-900 p-2">
                  {userProfile?.username}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Code
                </label>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: userProfile?.colorCode }}
                  />
                  <span className="text-gray-900 font-mono">
                    {userProfile?.colorCode}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="text-gray-900">
                  {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Actions
            </h2>
            
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
              
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Change Password
              </button>
              
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 