import axios from 'axios'
import Cookies from 'js-cookie'
import { User, PersonalityProfile, Match, Message, OnboardingProgress } from './utils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Real API functions using Django backend
export const auth = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login/', { email, password })
    const { user, access } = response.data
    Cookies.set('auth-token', access, { expires: 1, secure: false, sameSite: 'lax' })
    return { user, token: access }
  },

  register: async (userData: any): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register/', {
      ...userData,
      password_confirm: userData.password
    })
    const { user, tokens } = response.data
    Cookies.set('auth-token', tokens.access, { expires: 1, secure: false, sameSite: 'lax' })
    return { user, token: tokens.access }
  },

  logout: async (): Promise<void> => {
    Cookies.remove('auth-token')
    try {
      await api.post('/auth/logout/')
    } catch (error) {
      // Ignore logout errors
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/')
    return response.data
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch('/auth/profile/', userData)
    return response.data
  },

  getPublicProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/auth/users/${userId}/`)
    return response.data
  },

  // Onboarding progress functions
  getOnboardingProgress: async (): Promise<OnboardingProgress> => {
    const response = await api.get('/auth/onboarding/progress/')
    return response.data
  },

  updateOnboardingProgress: async (step: string): Promise<OnboardingProgress> => {
    const response = await api.post('/auth/onboarding/progress/update/', { step })
    return response.data
  },

  recalculateOnboardingProgress: async (): Promise<OnboardingProgress> => {
    const response = await api.post('/auth/onboarding/progress/recalculate/')
    return response.data
  }
}

export const personality = {
  getAssessment: async (): Promise<{ questions: any[] }> => {
    const response = await api.get('/personality/assessment/')
    return { questions: response.data }
  },

  submitAssessment: async (assessmentData: any): Promise<PersonalityProfile> => {
    const response = await api.post('/personality/submit/', assessmentData)
    return response.data.profile
  }
}

export const matching = {
  getSuggestions: async (): Promise<User[]> => {
    const response = await api.get('/matching/suggestions/')
    return response.data
  },

  getMatches: async (): Promise<Match[]> => {
    const response = await api.get('/matching/matches/')
    return response.data
  },

  getMatchRequests: async (): Promise<any[]> => {
    const response = await api.get('/matching/requests/')
    return response.data
  },

  acceptMatch: async (userId: string): Promise<Match> => {
    const response = await api.post('/matching/accept/', { user_id: userId })
    return response.data
  },

  rejectMatch: async (userId: string): Promise<void> => {
    await api.post('/matching/reject/', { user_id: userId })
  },

  respondToMatchRequest: async (userId: string, response: 'accept' | 'decline'): Promise<any> => {
    const result = await api.post('/matching/respond/', { user_id: userId, response })
    return result.data
  },

  requestMatch: async (userId: string): Promise<any> => {
    const response = await api.post('/matching/request/', { user_id: userId })
    return response.data
  }
}

export const messaging = {
  getMessages: async (matchId: string): Promise<Message[]> => {
    const response = await api.get(`/messaging/${matchId}/`)
    return response.data.messages || []
  },

  sendMessage: async (matchId: string, content: string): Promise<Message> => {
    const response = await api.post('/messaging/send/', { match_id: matchId, content })
    return response.data
  }
}

export const coliving = {
  getLivingSpaces: async (): Promise<any[]> => {
    const response = await api.get('/coliving/living-spaces/')
    return response.data.results || response.data
  },

  createLivingSpace: async (spaceData: any): Promise<any> => {
    const response = await api.post('/coliving/living-spaces/', spaceData)
    return response.data
  },

  updateLivingSpace: async (id: string, spaceData: any): Promise<any> => {
    const response = await api.put(`/coliving/living-spaces/${id}/`, spaceData)
    return response.data
  },

  getLivingSpace: async (id: string): Promise<any> => {
    const response = await api.get(`/coliving/living-spaces/${id}/`)
    return response.data
  },

  getRooms: async (): Promise<any[]> => {
    const response = await api.get('/coliving/rooms/')
    return response.data.results || response.data
  },

  createRoom: async (roomData: any): Promise<any> => {
    const response = await api.post('/coliving/rooms/', roomData)
    return response.data
  },

  applyForRoom: async (roomId: string, applicationData: any): Promise<any> => {
    const response = await api.post(`/coliving/rooms/${roomId}/apply/`, applicationData)
    return response.data
  },

  joinSpace: async (spaceId: string): Promise<any> => {
    const response = await api.post(`/coliving/living-spaces/${spaceId}/join/`)
    return response.data
  },

  getDashboard: async (): Promise<any> => {
    const response = await api.get('/coliving/dashboard/')
    return response.data
  },

  searchSpaces: async (params: any): Promise<any> => {
    const response = await api.get('/coliving/search/', { params })
    return response.data
  },

  uploadImage: async (spaceId: string, imageData: FormData): Promise<any> => {
    const response = await api.post('/coliving/images/', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteImage: async (imageId: string): Promise<void> => {
    await api.delete(`/coliving/images/${imageId}/`)
  },

  updateImage: async (imageId: string, data: any): Promise<any> => {
    const response = await api.put(`/coliving/images/${imageId}/`, data)
    return response.data
  },

  bookRoom: async (roomId: string, bookingData: any): Promise<any> => {
    const response = await api.post(`/coliving/rooms/${roomId}/book/`, bookingData)
    return response.data
  },

  requestSpaceMatch: async (spaceId: string, targetUserId: string): Promise<any> => {
    const response = await api.post(`/coliving/living-spaces/${spaceId}/request-match/`, { target_user_id: targetUserId })
    return response.data
  }
}