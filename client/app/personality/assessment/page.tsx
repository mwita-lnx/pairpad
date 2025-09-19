'use client'

import { useState, useEffect } from 'react'
import { usePersonalityStore, useAuthStore } from '@/lib/store'
import { personality } from '@/lib/api'

const assessmentQuestions = [
  // Openness to Experience
  { id: 1, trait: 'openness', question: 'I enjoy trying new and unusual experiences', reverse: false },
  { id: 2, trait: 'openness', question: 'I prefer routine and familiar activities', reverse: true },
  { id: 3, trait: 'openness', question: 'I appreciate art, music, and creative expression', reverse: false },

  // Conscientiousness
  { id: 4, trait: 'conscientiousness', question: 'I am always prepared and organized', reverse: false },
  { id: 5, trait: 'conscientiousness', question: 'I often leave things until the last minute', reverse: true },
  { id: 6, trait: 'conscientiousness', question: 'I pay attention to details', reverse: false },

  // Extraversion
  { id: 7, trait: 'extraversion', question: 'I enjoy being around people and social gatherings', reverse: false },
  { id: 8, trait: 'extraversion', question: 'I prefer spending time alone rather than with others', reverse: true },
  { id: 9, trait: 'extraversion', question: 'I feel energized by social interactions', reverse: false },

  // Agreeableness
  { id: 10, trait: 'agreeableness', question: 'I try to be helpful and considerate to others', reverse: false },
  { id: 11, trait: 'agreeableness', question: 'I often put my needs before others', reverse: true },
  { id: 12, trait: 'agreeableness', question: 'I trust others easily', reverse: false },

  // Neuroticism
  { id: 13, trait: 'neuroticism', question: 'I often feel anxious or stressed', reverse: false },
  { id: 14, trait: 'neuroticism', question: 'I remain calm under pressure', reverse: true },
  { id: 15, trait: 'neuroticism', question: 'I worry about things frequently', reverse: false },
]

const lifestyleQuestions = [
  { id: 16, question: 'How important is cleanliness to you?', type: 'scale', key: 'cleanliness' },
  { id: 17, question: 'How social do you like your living environment?', type: 'scale', key: 'socialLevel' },
  { id: 18, question: 'Do you prefer quiet hours after 10 PM?', type: 'boolean', key: 'quietHours' },
  { id: 19, question: 'Are you comfortable living with pets?', type: 'boolean', key: 'pets' },
  { id: 20, question: 'Do you smoke or are you okay with smoking indoors?', type: 'boolean', key: 'smoking' },
]

export default function PersonalityAssessment() {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<{ [key: number]: number | boolean }>({})
  const [lifestyleResponses, setLifestyleResponses] = useState<{ [key: string]: number | boolean }>({})
  const [communicationStyle, setCommunicationStyle] = useState<string>('diplomatic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiQuestions, setApiQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stepTransition, setStepTransition] = useState(false)
  const [clickedButton, setClickedButton] = useState<number | null>(null)

  const { updateAssessment, completeAssessment } = usePersonalityStore()
  const { updateUser } = useAuthStore()

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const result = await personality.getAssessment()
        setApiQuestions(result.questions || [])
      } catch (error) {
        console.error('Failed to load questions:', error)
        setApiQuestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    loadQuestions()

    return () => clearTimeout(timeoutId)
  }, [])

  const handlePersonalityResponse = (questionId: number, value: number) => {
    setClickedButton(questionId * 10 + value)
    setTimeout(() => setClickedButton(null), 300)
    setResponses({ ...responses, [questionId]: value })
  }

  const handleLifestyleResponse = (key: string, value: number | boolean) => {
    setLifestyleResponses({ ...lifestyleResponses, [key]: value })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const questionsToUse = apiQuestions.length > 0 ? apiQuestions : assessmentQuestions

      const formattedResponses = questionsToUse.map(question => ({
        question: question.id,
        response_value: responses[question.id] || 3,
        response_boolean: null,
        response_text: ''
      }))

      const submissionData = {
        responses: formattedResponses,
        lifestyle_preferences: {
          cleanliness: lifestyleResponses.cleanliness as number || 50,
          socialLevel: lifestyleResponses.socialLevel as number || 50,
          quietHours: lifestyleResponses.quietHours as boolean || false,
          pets: lifestyleResponses.pets as boolean || false,
          smoking: lifestyleResponses.smoking as boolean || false,
        },
        communication_style: communicationStyle as 'direct' | 'diplomatic' | 'casual' | 'formal'
      }

      const result = await personality.submitAssessment(submissionData)
      updateAssessment(result)
      completeAssessment()
      updateUser({ personalityProfile: result })

      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepAccents = [
    'bg-blue-500',     // Step 1: Personality - Blue
    'bg-blue-500',     // Step 2: Lifestyle - Blue
    'bg-blue-500'      // Step 3: Communication - Blue
  ]

  const renderPersonalityQuestions = () => {
    const questionsToUse = apiQuestions.length > 0 ? apiQuestions : assessmentQuestions

    if (isLoading) {
      return (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading questions...</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin hover:animate-bounce transform hover:scale-125 transition-all duration-500">
            <span className="text-white text-2xl font-bold animate-pulse">1</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Personality Assessment</h2>
          <p className="text-gray-600 text-lg">Rate how much you agree with each statement</p>
        </div>

        {questionsToUse.map((question, index) => (
          <div key={question.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 text-lg font-medium mb-6 leading-relaxed">
                  {question.question_text || question.question}
                </h3>

                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePersonalityResponse(question.id, value)}
                      className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                        responses[question.id] === value
                          ? 'bg-blue-500 text-white shadow-2xl scale-125 rotate-12 animate-bounce'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-125 hover:rotate-6 hover:shadow-xl'
                      } ${clickedButton === question.id * 10 + value ? 'animate-spin scale-150' : ''}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderLifestyleQuestions = () => (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse hover:animate-spin transform hover:scale-125 transition-all duration-500">
          <span className="text-white text-2xl font-bold animate-bounce">2</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lifestyle Preferences</h2>
        <p className="text-gray-600 text-lg">Tell us about your living preferences</p>
      </div>

      {lifestyleQuestions.map((question, index) => (
        <div key={question.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 text-lg font-medium mb-6 leading-relaxed">
                {question.question}
              </h3>

              {question.type === 'scale' ? (
                <div>
                  <div className="flex justify-center gap-3 mb-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleLifestyleResponse(question.key, value * 20)}
                        className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                          lifestyleResponses[question.key] === value * 20
                            ? 'bg-blue-500 text-white shadow-2xl scale-125 rotate-12 animate-bounce'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-125 hover:rotate-6 hover:shadow-xl'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Not Important</span>
                    <span>Very Important</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleLifestyleResponse(question.key, true)}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                      lifestyleResponses[question.key] === true
                        ? 'bg-blue-500 text-white shadow-2xl scale-110 rotate-3 animate-pulse'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-110 hover:-rotate-3 hover:shadow-xl'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLifestyleResponse(question.key, false)}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                      lifestyleResponses[question.key] === false
                        ? 'bg-blue-500 text-white shadow-2xl scale-110 rotate-3 animate-pulse'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:scale-110 hover:-rotate-3 hover:shadow-xl'
                    }`}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderCommunicationStyle = () => (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-ping hover:animate-spin transform hover:scale-125 transition-all duration-500">
          <span className="text-white text-2xl font-bold animate-bounce">3</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Communication Style</h2>
        <p className="text-gray-600 text-lg">How do you prefer to communicate with roommates?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { value: 'direct', label: 'Direct', description: 'Straightforward and honest communication' },
          { value: 'diplomatic', label: 'Diplomatic', description: 'Tactful and considerate approach' },
          { value: 'casual', label: 'Casual', description: 'Relaxed and informal communication' },
          { value: 'formal', label: 'Formal', description: 'Structured and professional approach' },
        ].map((style) => (
          <div
            key={style.value}
            onClick={() => setCommunicationStyle(style.value)}
            className={`rounded-2xl p-6 border-2 cursor-pointer transition-all duration-500 transform ${
              communicationStyle === style.value
                ? 'bg-blue-500 border-blue-500 text-white shadow-2xl scale-110 rotate-2 animate-pulse'
                : 'bg-blue-50 border-blue-100 text-gray-700 hover:border-blue-300 hover:scale-110 hover:-rotate-2 hover:shadow-xl'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{style.label}</h3>
            <p className={communicationStyle === style.value ? 'text-blue-100' : 'text-gray-600'}>
              {style.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step <= currentStep ? stepAccents[step] : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div className={`transition-all duration-700 transform ${stepTransition ? 'scale-95 opacity-50 rotate-1' : 'scale-100 opacity-100 rotate-0'}`}>
            {currentStep === 0 && renderPersonalityQuestions()}
            {currentStep === 1 && renderLifestyleQuestions()}
            {currentStep === 2 && renderCommunicationStyle()}
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-3xl mx-auto mt-12 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-xl font-medium text-gray-600 border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 transition-all duration-200"
          >
            Previous
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => {
                setStepTransition(true)
                setTimeout(() => {
                  setCurrentStep(currentStep + 1)
                  setStepTransition(false)
                }, 350)
              }}
              className={`px-6 py-3 rounded-xl font-medium text-white ${stepAccents[currentStep]} hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg transform hover:shadow-2xl animate-pulse`}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-medium text-white bg-blue-500 hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:shadow-2xl animate-bounce"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}