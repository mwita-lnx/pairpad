'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { auth } from '@/lib/api'

export default function Navigation() {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await auth.logout()
    } catch (error) {
      // Ignore logout errors
    }
    logout()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              PairPad
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/matches"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Matches
            </Link>
            <Link
              href="/messages"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Messages
            </Link>
            <Link
              href="/coliving"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Co-Living
            </Link>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Welcome, {user?.username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}