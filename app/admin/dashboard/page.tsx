'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaChartLine,
  FaDatabase,
  FaUsers,
  FaUserShield,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaComments,
} from 'react-icons/fa'

// Import tab components
import TrafficAnalyticsTab from '@/components/admin/TrafficAnalyticsTab'
import DatabaseManagementTab from '@/components/admin/DatabaseManagementTab'
import ListingsManagementTab from '@/components/admin/ListingsManagementTab'
import UserManagementTab from '@/components/admin/UserManagementTab'
import AdminUserManagementTab from '@/components/admin/AdminUserManagementTab'
import EmailManagementTab from '@/components/admin/EmailManagementTab'
import ContactSubmissionsTab from '@/components/admin/ContactSubmissionsTab'

type TabType = 'analytics' | 'listings' | 'database' | 'users' | 'admins' | 'email' | 'contacts'

interface Tab {
  id: TabType
  name: string
  icon: React.ReactNode
  resource: string
}

const tabs: Tab[] = [
  { id: 'analytics', name: 'Traffic Analytics', icon: <FaChartLine />, resource: 'traffic_analytics' },
  { id: 'listings', name: 'Listings (Featured/Verified)', icon: <FaDatabase />, resource: 'database_management' },
  { id: 'database', name: 'Database Management', icon: <FaDatabase />, resource: 'database_management' },
  { id: 'users', name: 'User Management', icon: <FaUsers />, resource: 'user_management' },
  { id: 'admins', name: 'Admin Users', icon: <FaUserShield />, resource: 'admin_user_management' },
  { id: 'email', name: 'Email Management', icon: <FaEnvelope />, resource: 'email_management' },
  { id: 'contacts', name: 'Contact Submissions', icon: <FaComments />, resource: 'contact_submissions' },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('analytics')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [permissions, setPermissions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/session')
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        setUser(data.user)
        setPermissions(data.permissions || [])
      } catch (error) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const hasAccess = (resource: string) => {
    return permissions.some((p: any) => p.resource === resource)
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const accessibleTabs = tabs.filter((tab) => hasAccess(tab.resource))

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
              >
                {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
              <h1 className="ml-4 text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.email}</span>
                <span className="ml-2 text-gray-500">({user.role})</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-4rem)]">
            <nav className="mt-5 px-2">
              {accessibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 pb-20">
          {activeTab === 'analytics' && hasAccess('traffic_analytics') && <TrafficAnalyticsTab />}
          {activeTab === 'listings' && hasAccess('database_management') && <ListingsManagementTab />}
          {activeTab === 'database' && hasAccess('database_management') && <DatabaseManagementTab />}
          {activeTab === 'users' && hasAccess('user_management') && <UserManagementTab />}
          {activeTab === 'admins' && hasAccess('admin_user_management') && <AdminUserManagementTab />}
          {activeTab === 'email' && hasAccess('email_management') && <EmailManagementTab />}
          {activeTab === 'contacts' && hasAccess('contact_submissions') && <ContactSubmissionsTab />}
        </main>
      </div>
    </div>
  )
}

