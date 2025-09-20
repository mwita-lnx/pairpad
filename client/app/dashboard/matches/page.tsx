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
  const { user, checkAuth } = useAuthStore()
  const { suggestedMatches, setSuggestedMatches, addMatch } = useMatchStore()
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Refresh user data to ensure we have the latest personality profile
        await checkAuth()
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }

    loadData()
  }, [checkAuth])

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        if (user.personalityProfile) {
          const suggestions = await matching.getSuggestions()
          setSuggestedMatches(suggestions)
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error)
        if (user.personalityProfile) {
          toast.error('Failed to load match suggestions')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [user, setSuggestedMatches])

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
        <h4 className="font-bold text-[#484848]">Personality Compatibility</h4>
        {traits.map((trait) => {
          const difference = Math.abs(trait.user - trait.match)
          const compatibility = Math.max(0, 100 - (difference * 2))

          return (
            <div key={trait.name} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-[#484848]">{trait.name}</span>
                <span className="text-[#ff5a5f]">{Math.round(compatibility)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#ff5a5f]"
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
        <h4 className="font-bold text-[#484848]">Lifestyle Compatibility</h4>
        {lifestyle.map((item) => {
          if (item.type === 'boolean') {
            const match = item.user === item.match
            return (
              <div key={item.name} className="flex justify-between items-center">
                <span className="text-sm text-[#484848]">{item.name}</span>
                <span className={`text-sm font-medium ${match ? 'text-green-600' : 'text-[#ff5a5f]'}`}>
                  {match ? '✓ Compatible' : '✗ Different'}
                </span>
              </div>
            )
          } else {
            const difference = Math.abs((item.user as number) - (item.match as number))
            const compatibility = Math.max(0, 100 - (difference * 2))

            return (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[#484848]">{item.name}</span>
                  <span className="text-[#ff5a5f]">{Math.round(compatibility)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#ff5a5f]"
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
      <div className="min-h-screen bg-white font-['DynaPuff',Helvetica,Arial,sans-serif]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5a5f] mx-auto"></div>
            <p className="mt-2 text-[#484848]">Finding your perfect matches...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-['DynaPuff',Helvetica,Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#484848] mb-4">
            Your Perfect
            <span className="text-[#ff5a5f] block">Matches</span>
          </h1>
          <p className="text-xl text-[#484848] font-light">
            Discover roommates who are scientifically compatible with you
          </p>
        </div>

        {!user?.personalityProfile ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#484848] mb-4">
                Complete Your Profile First
              </h3>
              <p className="text-gray-600 mb-6">
                Take our personality assessment to get personalized matches
              </p>
              <Link href="/dashboard/personality/assessment">
                <button className="bg-[#ff5a5f] text-white px-8 py-4 rounded-2xl font-medium text-lg hover:bg-[#e54146] transition-all hover:scale-105 shadow-lg hover:shadow-xl">
                  Take Assessment
                </button>
              </Link>
            </div>
          </div>
        ) : suggestedMatches.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#484848] mb-4">
                No Matches Yet
              </h3>
              <p className="text-gray-600">
                We're working on finding compatible roommates for you. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {suggestedMatches.map((matchUser) => {
              const compatibilityScore = calculateCompatibilityScore(
                user.personalityProfile!,
                matchUser.personalityProfile!
              )

              return (
                <div key={matchUser.id} className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#484848] flex items-center gap-2">
                        {matchUser.username}
                        <span className="text-sm font-normal text-gray-500 capitalize">
                          • {matchUser.role}
                        </span>
                      </h3>
                      <p className="text-gray-600">
                        {matchUser.personalityProfile?.communicationStyle} communication style
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        compatibilityScore >= 80 ? 'text-green-600' :
                        compatibilityScore >= 60 ? 'text-orange-500' :
                        'text-[#ff5a5f]'
                      }`}>
                        {compatibilityScore}%
                      </div>
                      <div className="text-sm text-gray-500">compatible</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {renderCompatibilityBreakdown(matchUser)}
                    {renderLifestyleCompatibility(matchUser)}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptMatch(matchUser)}
                      disabled={actionLoading === matchUser.id}
                      className="flex-1 bg-[#ff5a5f] text-white py-3 rounded-2xl font-medium hover:bg-[#e54146] transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {actionLoading === matchUser.id ? 'Processing...' : '❤️ Like'}
                    </button>
                    <button
                      onClick={() => handleRejectMatch(matchUser)}
                      disabled={actionLoading === matchUser.id}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      👎 Pass
                    </button>
                    <Link href={`/dashboard/matches/${matchUser.id}`} className="flex-1">
                      <button className="w-full border-2 border-[#ff5a5f] text-[#ff5a5f] py-3 rounded-2xl font-medium hover:bg-[#ff5a5f] hover:text-white transition-all">
                        View Profile
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}