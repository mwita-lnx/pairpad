'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore, useMatchStore } from '@/lib/store'
import { matching } from '@/lib/api'
import { calculateCompatibilityScore, User } from '@/lib/utils'

export default function MatchesPage() {
  const { user } = useAuthStore()
  const { suggestedMatches, setSuggestedMatches, addMatch } = useMatchStore()
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestions = await matching.getSuggestions()
        setSuggestedMatches(suggestions)
      } catch (error) {
        console.error('Failed to load suggestions:', error)
        toast.error('Failed to load match suggestions')
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [setSuggestedMatches])

  const handleAcceptMatch = async (matchUser: User) => {
    setActionLoading(matchUser.id)
    try {
      const match = await matching.acceptMatch(matchUser.id)
      addMatch(match)
      // Remove from suggestions
      setSuggestedMatches(suggestedMatches.filter(u => u.id !== matchUser.id))

      if (match.status === 'mutual') {
        toast.success(`🎉 It's a match with ${matchUser.username}! You can now start chatting.`)
      } else {
        toast.success(`❤️ You liked ${matchUser.username}!`)
      }
    } catch (error) {
      console.error('Failed to accept match:', error)
      toast.error('Failed to like this user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectMatch = async (matchUser: User) => {
    setActionLoading(matchUser.id)
    try {
      await matching.rejectMatch(matchUser.id)
      // Remove from suggestions
      setSuggestedMatches(suggestedMatches.filter(u => u.id !== matchUser.id))
      toast.success(`👎 Passed on ${matchUser.username}`)
    } catch (error) {
      console.error('Failed to reject match:', error)
      toast.error('Failed to pass on this user')
    } finally {
      setActionLoading(null)
    }
  }

  const renderCompatibilityBreakdown = (matchUser: User) => {
    if (!user?.personalityProfile || !matchUser.personalityProfile) {
      return null
    }

    const userProfile = user.personalityProfile
    const matchProfile = matchUser.personalityProfile

    const traits = [
      { name: 'Openness', user: userProfile.openness, match: matchProfile.openness },
      { name: 'Conscientiousness', user: userProfile.conscientiousness, match: matchProfile.conscientiousness },
      { name: 'Extraversion', user: userProfile.extraversion, match: matchProfile.extraversion },
      { name: 'Agreeableness', user: userProfile.agreeableness, match: matchProfile.agreeableness },
      { name: 'Neuroticism', user: userProfile.neuroticism, match: matchProfile.neuroticism },
    ]

    return (
      <div className="space-y-3">
        <h4 className="font-medium">Personality Compatibility</h4>
        {traits.map((trait) => {
          const difference = Math.abs(trait.user - trait.match)
          const compatibility = Math.max(0, 100 - (difference * 2))

          return (
            <div key={trait.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{trait.name}</span>
                <span>{Math.round(compatibility)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    compatibility >= 80 ? 'bg-green-500' :
                    compatibility >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${compatibility}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>You: {trait.user}%</span>
                <span>Them: {trait.match}%</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderLifestyleCompatibility = (matchUser: User) => {
    if (!user?.personalityProfile || !matchUser.personalityProfile) {
      return null
    }

    const userPrefs = user.personalityProfile.lifestylePreferences
    const matchPrefs = matchUser.personalityProfile.lifestylePreferences

    const lifestyle = [
      { name: 'Cleanliness', user: userPrefs.cleanliness, match: matchPrefs.cleanliness, type: 'scale' },
      { name: 'Social Level', user: userPrefs.socialLevel, match: matchPrefs.socialLevel, type: 'scale' },
      { name: 'Quiet Hours', user: userPrefs.quietHours, match: matchPrefs.quietHours, type: 'boolean' },
      { name: 'Pets', user: userPrefs.pets, match: matchPrefs.pets, type: 'boolean' },
      { name: 'Smoking', user: userPrefs.smoking, match: matchPrefs.smoking, type: 'boolean' },
    ]

    return (
      <div className="space-y-3">
        <h4 className="font-medium">Lifestyle Compatibility</h4>
        {lifestyle.map((item) => {
          if (item.type === 'boolean') {
            const match = item.user === item.match
            return (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-sm">{item.name}</span>
                <span className={`text-sm font-medium ${match ? 'text-green-600' : 'text-red-600'}`}>
                  {match ? '✓ Compatible' : '✗ Different'}
                </span>
              </div>
            )
          } else {
            const difference = Math.abs((item.user as number) - (item.match as number))
            const compatibility = Math.max(0, 100 - (difference * 2))

            return (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{Math.round(compatibility)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      compatibility >= 80 ? 'bg-green-500' :
                      compatibility >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${compatibility}%` }}
                  />
                </div>
              </div>
            )
          }
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
        <p className="text-gray-600">
          Discover roommates who are scientifically compatible with you.
        </p>
      </div>

      {!user?.personalityProfile ? (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile First</CardTitle>
            <CardDescription>
              Take our personality assessment to get personalized matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/personality/assessment">
              <Button>Take Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : suggestedMatches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Matches Yet</CardTitle>
            <CardDescription>
              We're working on finding compatible roommates for you. Check back soon!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6">
          {suggestedMatches.map((matchUser) => {
            const compatibilityScore = calculateCompatibilityScore(
              user.personalityProfile!,
              matchUser.personalityProfile!
            )

            return (
              <Card key={matchUser.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {matchUser.username}
                        <span className="text-sm font-normal text-gray-500 capitalize">
                          • {matchUser.role}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {matchUser.personalityProfile?.communicationStyle} communication style
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        compatibilityScore >= 80 ? 'text-green-600' :
                        compatibilityScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {compatibilityScore}%
                      </div>
                      <div className="text-sm text-gray-500">compatible</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {renderCompatibilityBreakdown(matchUser)}
                    {renderLifestyleCompatibility(matchUser)}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => handleAcceptMatch(matchUser)}
                      disabled={actionLoading === matchUser.id}
                      className="flex-1"
                    >
                      {actionLoading === matchUser.id ? 'Processing...' : '❤️ Like'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectMatch(matchUser)}
                      disabled={actionLoading === matchUser.id}
                      className="flex-1"
                    >
                      👎 Pass
                    </Button>
                    <Link href={`/matches/${matchUser.id}`}>
                      <Button variant="outline">View Profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}