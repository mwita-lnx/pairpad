import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

export function calculateCompatibilityScore(
  user1Personality: PersonalityProfile,
  user2Personality: PersonalityProfile
): number {
  // Big Five traits compatibility scoring
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']

  let totalScore = 0
  traits.forEach(trait => {
    const diff = Math.abs(user1Personality[trait] - user2Personality[trait])
    // Convert difference to compatibility score (closer = higher score)
    const traitScore = Math.max(0, 100 - (diff * 20))
    totalScore += traitScore
  })

  return Math.round(totalScore / traits.length)
}

export interface PersonalityProfile {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  lifestylePreferences: {
    cleanliness: number
    socialLevel: number
    quietHours: boolean
    pets: boolean
    smoking: boolean
  }
  communicationStyle: 'direct' | 'diplomatic' | 'casual' | 'formal'
}

export interface User {
  id: string
  email: string
  username: string
  role: 'student' | 'professional' | 'admin' | 'coordinator'
  personalityProfile?: PersonalityProfile
  verificationStatus: 'pending' | 'verified' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  user1Id: string
  user2Id: string
  compatibilityScore: number
  status: 'pending' | 'accepted' | 'rejected' | 'mutual'
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  readStatus: boolean
  matchId: string
}