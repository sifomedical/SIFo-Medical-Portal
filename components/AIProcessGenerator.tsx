'use client'

import { useState } from 'react'
import { Loader, AlertCircle, ChevronRight } from 'lucide-react'
import VoiceInput from './VoiceInput'
import { CategoryId } from '@/types/process'

interface AIProcessGeneratorProps {
  category: CategoryId
  onGenerate: (processData: any) => void
  onBack: () => void
}

type Step = 'input' | 'processing' | 'questions' | 'complete'

export default function AIProcessGenerator({
  category,
  onGenerate,
  onBack,
}: AIProcessGeneratorProps) {
  const [step, setStep] = useState<Step>('input')
  const [userInput, setUserInput] = useState('')
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([])
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (voiceTranscript: string) => {
    setUserInput(voiceTranscript)
  }

  const handleGenerateProcess = async () => {
    if (!userInput.trim()) {
      setError('Bitte beschreibe den Prozess oder nutze die Sprachaufnahme.')
      return
    }

    setIsGenerating(true)
    setError(null)
    setStep('processing')

    try {
      const response = await fetch('/api/processes/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          userInput,
          clarifyingAnswers: Object.keys(clarifyingAnswers).length > 0 ? clarifyingAnswers : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler bei der Prozessgenerierung')
      }

      const result = await response.json()

      if (result.clarifying_questions && result.clarifying_questions.length > 0) {
        setClarifyingQuestions(result.clarifying_questions)
        setStep('questions')
      } else {
        onGenerate(result)
        setStep('complete')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Verarbeitung')
      setStep('input')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinueWithAnswers = async () => {
    await handleGenerateProcess()
  }

  const inputSteps = ['input', 'processing', 'questions']

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-[#F5F6F7] bg-white p-6 sm:p-8">
      {/* Header */}
      <div className="border-b border-[#F5F6F7] pb-4">
        <h2 className="text-2xl font-semibold text-[#0C2340]">Prozess-Beschreibung</h2>
        <p className="mt-1 text-sm text-[#6A7A8B]">
          Beschreibe den Prozess verbal oder per Text. Die KI generiert automatisch alle Details.
        </p>
      </div>

      {step === 'input' && (
        <div className="space-y-6">
          {/* Voice Input */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#0C2340]">Sprachaufnahme</h3>
            <VoiceInput onTranscriptChange={handleInputChange} isDisabled={isGenerating} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#F5F6F7]" />
            <span className="text-xs text-[#6A7A8B]">oder</span>
            <div className="flex-1 border-t border-[#F5F6F7]" />
          </div>

          {/* Text Input */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#0C2340]">Text-Eingabe</h3>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Beschreibe den Prozess hier... z.B. 'Verkaufsprozess für medizinische Geräte mit Lead-Qualifizierung und CRM-Integration'"
              className="h-32 w-full rounded-lg border border-[#E0E6ED] bg-white p-3 text-sm focus:border-[#00A68B] focus:outline-none focus:ring-1 focus:ring-[#00A68B]"
              disabled={isGenerating}
            />
            <p className="mt-2 text-xs text-[#9CA6B1]">
              Mindestens 10 Zeichen erforderlich. Je detaillierter, desto besser.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Character Count */}
          <p className="text-xs text-[#9CA6B1]">{userInput.length} Zeichen</p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onBack}
              disabled={isGenerating}
              className="flex-1 rounded-lg border border-[#E0E6ED] py-2 font-medium text-[#6A7A8B] hover:border-[#00A68B] hover:text-[#00A68B] disabled:opacity-50"
            >
              Zurück
            </button>
            <button
              onClick={handleGenerateProcess}
              disabled={
                !userInput.trim() || userInput.length < 10 || isGenerating
              }
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#00A68B] py-2 font-medium text-white hover:bg-[#008B72] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generiere...
                </>
              ) : (
                <>
                  Mit KI generieren
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="rounded-full bg-[#00A68B]/10 p-4">
            <Loader className="h-8 w-8 animate-spin text-[#00A68B]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0C2340]">Generiere deinen Prozess...</p>
            <p className="mt-1 text-sm text-[#6A7A8B]">Dies kann bis zu 30 Sekunden dauern.</p>
          </div>
        </div>
      )}

      {step === 'questions' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-[#00A68B]/20 bg-[#00A68B]/5 p-4">
            <p className="text-sm font-semibold text-[#0C2340]">
              ❓ Die KI benötigt noch ein paar Details
            </p>
            <p className="mt-2 text-sm text-[#6A7A8B]">
              Beantworte die folgenden Fragen, um einen präziseren Prozess zu generieren.
            </p>
          </div>

          {clarifyingQuestions.map((question, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-[#0C2340] mb-2">
                {question}
              </label>
              <input
                type="text"
                value={clarifyingAnswers[question] || ''}
                onChange={(e) =>
                  setClarifyingAnswers((prev) => ({
                    ...prev,
                    [question]: e.target.value,
                  }))
                }
                placeholder="Antworte hier..."
                className="w-full rounded-lg border border-[#E0E6ED] bg-white p-3 text-sm focus:border-[#00A68B] focus:outline-none focus:ring-1 focus:ring-[#00A68B]"
              />
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onBack}
              disabled={isGenerating}
              className="flex-1 rounded-lg border border-[#E0E6ED] py-2 font-medium text-[#6A7A8B] hover:border-[#00A68B] hover:text-[#00A68B] disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleContinueWithAnswers}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#00A68B] py-2 font-medium text-white hover:bg-[#008B72] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generiere erneut...
                </>
              ) : (
                <>
                  Weiter mit Antworten
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="rounded-full bg-[#00A68B]/10 p-4">
            <ChevronRight className="h-8 w-8 text-[#00A68B] rotate-90" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#0C2340]">Prozess erfolgreich generiert! ✨</p>
            <p className="mt-1 text-sm text-[#6A7A8B]">
              Du wirst jetzt zum Bearbeitungsformular weitergeleitet...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
