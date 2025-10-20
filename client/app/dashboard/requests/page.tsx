'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { matching } from '@/lib/api'
import { Heart, X, MapPin, Calendar } from 'lucide-react'

interface MatchRequest {
  id: string
  requestingUser: any
  compatibilityScore: number | {
    compatibility_score: number
    similarity_score: number
    breakdown: any
  }
  createdAt: string
}

export default function MatchRequestsPage() {
  const [requests, setRequests] = useState<MatchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)

  useEffect(() => {
    loadMatchRequests()
  }, [])

  const getCompatibilityScore = (score: number | { compatibility_score: number; similarity_score: number; breakdown: any }): number => {
    if (typeof score === 'number') {
      return score
    }
    return score.compatibility_score || 0
  }

  const loadMatchRequests = async () => {
    try {
      const requestsData = await matching.getMatchRequests()
      setRequests(requestsData)
    } catch (error) {
      console.error('Failed to load match requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (userId: string, response: 'accept' | 'decline') => {
    setRespondingTo(userId)
    try {
      await matching.respondToMatchRequest(userId, response)
      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.requestingUser.id !== userId))

      if (response === 'accept') {
        // Show success message for match
        alert('Match created! You can now start messaging.')
      }
    } catch (error) {
      console.error('Failed to respond to match request:', error)
      alert('Failed to respond to match request')
    } finally {
      setRespondingTo(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['DynaPuff',Helvetica,Arial,sans-serif]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#484848] mb-4">
              Match Requests
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d41ab] mx-auto mt-8"></div>
            <p className="mt-4 text-gray-600">Loading your match requests...</p>
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
            Match Requests
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            People who are interested in being your roommate.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-[#5d41ab]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#5d41ab]" />
              </div>
              <h2 className="text-2xl font-bold text-[#484848] mb-4">
                No Match Requests
              </h2>
              <p className="text-gray-600 mb-8">
                No one has liked your profile yet. Make sure your profile is complete and engaging!
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {requests.map((request) => {
              const user = request.requestingUser
              const userInitial = user.username?.charAt(0).toUpperCase() || 'U'
              const isResponding = respondingTo === user.id

              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-[#5d41ab]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#5d41ab] font-bold text-xl">
                            {userInitial}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-[#484848] text-xl">
                              {user.username || user.first_name || 'Unknown User'}
                            </h3>
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                              {Math.round(getCompatibilityScore(request.compatibilityScore))}% compatible
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {user.current_city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{user.current_city}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Liked {formatDate(request.createdAt)}</span>
                            </div>
                          </div>

                          {user.bio && (
                            <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleResponse(user.id, 'decline')}
                          variant="outline"
                          size="sm"
                          disabled={isResponding}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          onClick={() => handleResponse(user.id, 'accept')}
                          size="sm"
                          disabled={isResponding}
                          className="bg-[#5d41ab] hover:bg-[#4c2d87]"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}