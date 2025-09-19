'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMatchStore, useMessageStore } from '@/lib/store'
import { formatDate } from '@/lib/utils'

export default function MessagesPage() {
  const { matches } = useMatchStore()
  const { messages } = useMessageStore()
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    // Create conversation list from matches with last message info
    const convos = matches.map(match => {
      const matchMessages = messages[match.id] || []
      const lastMessage = matchMessages[matchMessages.length - 1]
      const unreadCount = matchMessages.filter(msg => !msg.readStatus && msg.receiverId === '1').length

      return {
        match,
        lastMessage,
        unreadCount,
        lastActivity: lastMessage?.timestamp || match.createdAt
      }
    }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

    setConversations(convos)
  }, [matches, messages])

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            Start conversations with your matched roommates.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Conversations Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You haven't matched with anyone yet. Find compatible roommates to start messaging.
            </p>
            <Link href="/matches">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Find Matches
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">
          Your conversations with matched roommates.
        </p>
      </div>

      <div className="space-y-4">
        {conversations.map(({ match, lastMessage, unreadCount, lastActivity }) => {
          // Get the other user in the match
          const otherUserId = match.user1Id === '1' ? match.user2Id : match.user1Id

          return (
            <Link key={match.id} href={`/messages/${match.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {otherUserId === '2' ? 'A' : 'B'}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {otherUserId === '2' ? 'Alice' : 'Bob'}
                          </h3>
                          <span className="text-sm text-green-600">
                            {match.compatibilityScore}% compatible
                          </span>
                          {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>

                        {lastMessage ? (
                          <div>
                            <p className="text-gray-600 text-sm truncate">
                              {lastMessage.senderId === '1' ? 'You: ' : ''}
                              {lastMessage.content}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {formatDate(lastMessage.timestamp)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            New match • Start a conversation
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}