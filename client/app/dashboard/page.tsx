'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore, useMatchStore } from '@/lib/store'
import { matching } from '@/lib/api'
import { calculateCompatibilityScore, User } from '@/lib/utils'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { suggestedMatches, setSuggestedMatches } = useMatchStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestions = await matching.getSuggestions()
        setSuggestedMatches(suggestions)
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [setSuggestedMatches])

  const renderPersonalityStats = () => {
    if (!user?.personalityProfile) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Take our personality assessment to get better matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/personality/assessment">
              <Button>Take Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      )
    }

    const { personalityProfile } = user
    const traits = [
      { name: 'Openness', value: personalityProfile.openness, color: 'bg-purple-500' },
      { name: 'Conscientiousness', value: personalityProfile.conscientiousness, color: 'bg-blue-500' },
      { name: 'Extraversion', value: personalityProfile.extraversion, color: 'bg-green-500' },
      { name: 'Agreeableness', value: personalityProfile.agreeableness, color: 'bg-yellow-500' },
      { name: 'Neuroticism', value: personalityProfile.neuroticism, color: 'bg-red-500' },
    ]

    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Personality Profile</CardTitle>
          <CardDescription>Based on Big Five personality traits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {traits.map((trait) => (
              <div key={trait.name}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{trait.name}</span>
                  <span>{trait.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${trait.color}`}
                    style={{ width: `${trait.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderRecentMatches = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Match Suggestions</CardTitle>
        <CardDescription>People you might be compatible with</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading suggestions...</div>
        ) : suggestedMatches.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No suggestions available. Complete your personality assessment to get matches.
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedMatches.slice(0, 3).map((match) => {
              const compatibilityScore = user?.personalityProfile && match.personalityProfile
                ? calculateCompatibilityScore(user.personalityProfile, match.personalityProfile)
                : 0

              return (
                <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{match.username}</h4>
                    <p className="text-sm text-gray-600 capitalize">{match.role}</p>
                    <p className="text-sm text-green-600">{compatibilityScore}% compatible</p>
                  </div>
                  <Link href={`/matches/${match.id}`}>
                    <Button size="sm">View Profile</Button>
                  </Link>
                </div>
              )
            })}
            <Link href="/matches">
              <Button variant="outline" className="w-full">
                View All Matches
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/matches" className="block">
          <Button variant="outline" className="w-full justify-start">
            🎯 Find Matches
          </Button>
        </Link>
        <Link href="/messages" className="block">
          <Button variant="outline" className="w-full justify-start">
            💬 Check Messages
          </Button>
        </Link>
        <Link href="/coliving" className="block">
          <Button variant="outline" className="w-full justify-start">
            🏠 Manage Co-Living
          </Button>
        </Link>
        <Link href="/personality/assessment" className="block">
          <Button variant="outline" className="w-full justify-start">
            📊 Update Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your roommate search.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {renderPersonalityStats()}
          {renderRecentMatches()}
        </div>

        <div className="space-y-8">
          {renderQuickActions()}

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Verification:</span>
                  <span className={`font-medium ${
                    user?.verificationStatus === 'verified' ? 'text-green-600' :
                    user?.verificationStatus === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {user?.verificationStatus || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profile:</span>
                  <span className="font-medium text-green-600">
                    {user?.personalityProfile ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account Type:</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}