'use client'

import { useState, useEffect } from 'react'
import { usePersonalityStore, useAuthStore } from '@/lib/store'
import { personality } from '@/lib/api'
import Link from 'next/link'

// Icons as SVG components
const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 2C8.25 2 7.25 3 7.25 4.25c0 .41.11.8.3 1.15-.7.27-1.2.94-1.2 1.73 0 .5.2.95.51 1.28C6.34 8.7 6 9.33 6 10.05c0 .53.2 1.01.52 1.38-.32.37-.52.85-.52 1.38 0 1.1.9 2 2 2h.09c.17.53.53.96 1 1.22-.1.24-.15.5-.15.77 0 1.1.9 2 2 2s2-.9 2-2c0-.27-.05-.53-.15-.77.47-.26.83-.69 1-1.22H14c1.1 0 2-.9 2-2 0-.53-.2-1.01-.52-1.38.32-.37.52-.85.52-1.38 0-.72-.34-1.35-.86-1.74.31-.33.51-.78.51-1.28 0-.79-.5-1.46-1.2-1.73.19-.35.3-.74.3-1.15C14.75 3 13.75 2 12.5 2c-.69 0-1.3.31-1.71.79C10.38 2.31 9.94 2 9.5 2z" fill="currentColor"/>
  </svg>
)

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
)

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
)

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
  const { updateUser, checkAuth } = useAuthStore()

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

      // Refresh user data from server to ensure consistency
      await checkAuth()

      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Failed to submit assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }


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
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <BrainIcon />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#484848] mb-3 sm:mb-4 px-4">Personality Assessment</h2>
          <p className="text-[#9ca299] text-base sm:text-lg font-light px-4">Rate how much you agree with each statement</p>
        </div>

        {questionsToUse.map((question, index) => (
          <div key={question.id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white font-bold text-sm sm:text-base">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-[#484848] text-lg sm:text-xl font-medium mb-6 sm:mb-8 leading-relaxed">
                  {question.question_text || question.question}
                </h3>

                <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handlePersonalityResponse(question.id, value)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                        responses[question.id] === value
                          ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] text-white shadow-lg scale-110'
                          : 'bg-white border-2 border-gray-200 text-[#484848] hover:border-[#ff5a5f] hover:scale-105 hover:shadow-md'
                      } ${clickedButton === question.id * 10 + value ? 'animate-pulse scale-105' : ''}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-[#9ca299] text-sm font-light">
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg text-white">
          <TargetIcon />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#484848] mb-3 sm:mb-4 px-4">Lifestyle Preferences</h2>
        <p className="text-[#9ca299] text-base sm:text-lg font-light px-4">Tell us about your living preferences</p>
      </div>

      {lifestyleQuestions.map((question, index) => (
        <div key={question.id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white font-bold text-sm sm:text-base">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-[#484848] text-lg sm:text-xl font-medium mb-6 sm:mb-8 leading-relaxed">
                {question.question}
              </h3>

              {question.type === 'scale' ? (
                <div>
                  <div className="flex justify-center gap-2 sm:gap-3 mb-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleLifestyleResponse(question.key, value * 20)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                          lifestyleResponses[question.key] === value * 20
                            ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] text-white shadow-lg scale-110'
                            : 'bg-white border-2 border-gray-200 text-[#484848] hover:border-[#ff5a5f] hover:scale-105 hover:shadow-md'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[#9ca299] text-sm font-light">
                    <span>Not Important</span>
                    <span>Very Important</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => handleLifestyleResponse(question.key, true)}
                    className={`px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium transition-all duration-300 transform ${
                      lifestyleResponses[question.key] === true
                        ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-200 text-[#484848] hover:border-[#ff5a5f] hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLifestyleResponse(question.key, false)}
                    className={`px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium transition-all duration-300 transform ${
                      lifestyleResponses[question.key] === false
                        ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-200 text-[#484848] hover:border-[#ff5a5f] hover:scale-105 hover:shadow-md'
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ff5a5f] to-[#e54146] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg text-white">
          <HomeIcon />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#484848] mb-3 sm:mb-4 px-4">Communication Style</h2>
        <p className="text-[#9ca299] text-base sm:text-lg font-light px-4">How do you prefer to communicate with roommates?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[
          { value: 'direct', label: 'Direct', description: 'Straightforward and honest communication' },
          { value: 'diplomatic', label: 'Diplomatic', description: 'Tactful and considerate approach' },
          { value: 'casual', label: 'Casual', description: 'Relaxed and informal communication' },
          { value: 'formal', label: 'Formal', description: 'Structured and professional approach' },
        ].map((style) => (
          <div
            key={style.value}
            onClick={() => setCommunicationStyle(style.value)}
            className={`rounded-2xl p-6 sm:p-8 border-2 cursor-pointer transition-all duration-300 transform ${
              communicationStyle === style.value
                ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] border-[#ff5a5f] text-white shadow-lg scale-105'
                : 'bg-white border-gray-200 text-[#484848] hover:border-[#ff5a5f] hover:scale-105 hover:shadow-lg'
            }`}
          >
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{style.label}</h3>
            <p className={`text-sm sm:text-base font-light leading-relaxed ${communicationStyle === style.value ? 'text-red-100' : 'text-[#9ca299]'}`}>
              {style.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-white font-['DynaPuff',Helvetica,Arial,sans-serif]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-[#ff5a5f] text-xl sm:text-2xl font-bold">
              PairPad
            </Link>
            <div className="flex gap-2 sm:gap-4">
              <Link href="/dashboard">
                <button className="text-[#484848] text-sm sm:text-base font-medium hover:text-[#ff5a5f] transition-colors">
                  Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#484848] mb-4 sm:mb-6">Complete Your Profile</h1>
          <p className="text-lg sm:text-xl text-[#9ca299] font-light mb-6 sm:mb-8 px-4">
            Help us understand your personality, lifestyle, and communication preferences to find your perfect roommate match.
          </p>

          {/* Mobile Progress - Stacked */}
          <div className="flex sm:hidden flex-col items-center gap-3 mb-8">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center w-full max-w-xs">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step === 0 && <BrainIcon />}
                  {step === 1 && <TargetIcon />}
                  {step === 2 && <HomeIcon />}
                </div>
                <div className="ml-3 text-left">
                  <div className={`text-sm font-medium ${step <= currentStep ? 'text-[#ff5a5f]' : 'text-gray-400'}`}>
                    {step === 0 && 'Personality'}
                    {step === 1 && 'Lifestyle'}
                    {step === 2 && 'Communication'}
                  </div>
                  <div className={`text-xs ${step === currentStep ? 'text-[#484848]' : 'text-gray-400'}`}>
                    {step === currentStep ? 'Current' : step < currentStep ? 'Complete' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Progress - Horizontal */}
          <div className="hidden sm:flex items-center justify-center gap-4">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? 'bg-gradient-to-br from-[#ff5a5f] to-[#e54146] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step === 0 && <BrainIcon />}
                  {step === 1 && <TargetIcon />}
                  {step === 2 && <HomeIcon />}
                </div>
                {step < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step < currentStep ? 'bg-gradient-to-r from-[#ff5a5f] to-[#e54146]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
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
        <div className="max-w-3xl mx-auto mt-12 sm:mt-16">
          {/* Mobile Navigation - Stacked */}
          <div className="flex sm:hidden flex-col gap-4">
            {currentStep < totalSteps - 1 ? (
              <>
                <button
                  onClick={() => {
                    setStepTransition(true)
                    setTimeout(() => {
                      setCurrentStep(currentStep + 1)
                      setStepTransition(false)
                    }, 350)
                  }}
                  className="w-full px-6 py-4 rounded-full font-medium text-white bg-gradient-to-r from-[#ff5a5f] to-[#e54146] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Next Step
                </button>
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    className="w-full px-6 py-3 rounded-full font-medium text-[#9ca299] border-2 border-gray-200 hover:border-[#ff5a5f] hover:text-[#ff5a5f] transition-all duration-300"
                  >
                    Previous
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-full font-medium text-white bg-gradient-to-r from-[#ff5a5f] to-[#e54146] hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                </button>
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="w-full px-6 py-3 rounded-full font-medium text-[#9ca299] border-2 border-gray-200 hover:border-[#ff5a5f] hover:text-[#ff5a5f] transition-all duration-300"
                >
                  Previous
                </button>
              </>
            )}
          </div>

          {/* Desktop Navigation - Side by side */}
          <div className="hidden sm:flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-8 py-4 rounded-full font-medium text-[#9ca299] border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#ff5a5f] hover:text-[#ff5a5f] transition-all duration-300"
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
                className="px-8 py-4 rounded-full font-medium text-white bg-gradient-to-r from-[#ff5a5f] to-[#e54146] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-full font-medium text-white bg-gradient-to-r from-[#ff5a5f] to-[#e54146] hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}