import axios from 'axios'
import Cookies from 'js-cookie'
import { User, PersonalityProfile, Match, Message } from './utils'

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

  register: async (userData: {
    email: string
    password: string
    username: string
    role: User['role']
  }): Promise<{ user: User; token: string }> => {
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

  acceptMatch: async (userId: string): Promise<Match> => {
    const response = await api.post('/matching/accept/', { user_id: userId })
    return response.data
  },

  rejectMatch: async (userId: string): Promise<void> => {
    await api.post('/matching/reject/', { user_id: userId })
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