'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/types/process'
import { CategoryId, Process } from '@/types/process'
import AIProcessGenerator from '@/components/AIProcessGenerator'
import ProcessPreviewForm from '@/components/ProcessPreviewForm'
import { ChevronRight } from 'lucide-react'

type Step = 'input' | 'preview'

export default function CreateProcessPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [generatedProcess, setGeneratedProcess] = useState<Partial<Process> | null>(null)

  const handleGenerateProcess = (processData: Partial<Process>) => {
    setGeneratedProcess({
      ...processData,
      category: selectedCategory!
    })
    setStep('preview')
  }

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  const handleBackFromPreview = () => {
    setGeneratedProcess(null)
    setStep('input')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F6F7] to-white py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        {step === 'input' && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-2">
              ✨ Neuen Prozess erstellen
            </h1>
            <p className="text-[#6A7A8B]">
              Beschreibe deinen Prozess per Sprache oder Text. Die KI generiert automatisch alle
              Dokumentationen.
            </p>
            <p className="text-sm text-[#6A7A8B] mt-4">Schritt 1 von 2 - Prozess beschreiben</p>
          </div>
        )}

        {step === 'preview' && (
          <div className="mb-8">
            <button
              onClick={handleBackFromPreview}
              className="mb-4 flex items-center gap-1 text-sm text-[#00A68B] hover:text-[#008B72]"
            >
              ← Zurück zur Beschreibung
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C2340] mb-1">
                Prozess überprüfen
              </h1>
              <p className="text-[#6A7A8B]">Schritt 2 von 2 - Details anpassen und speichern</p>
            </div>
          </div>
        )}

        {/* Step 1: Category Selection + Voice/Text Input */}
        {step === 'input' && (
          <div className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-sm font-medium text-[#0C2340] mb-3">
                Abteilung wählen
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedCategory === category.id
                        ? `${category.borderColor} bg-[#00A68B]/5`
                        : 'border-[#E0E7F1] hover:border-[#00A68B] hover:bg-[#00A68B]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-semibold text-[#0C2340]">{category.title}</h4>
                        <p className="text-xs text-[#6A7A8B]">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice/Text Input - Only show if category selected */}
            {selectedCategory && (
              <AIProcessGenerator
                category={selectedCategory}
                onGenerate={handleGenerateProcess}
                onBack={() => setSelectedCategory(null)}
              />
            )}
          </div>
        )}

        {/* Step 2: Form Preview & Edit */}
        {step === 'preview' && generatedProcess && (
          <ProcessPreviewForm
            initialProcess={generatedProcess}
            onSuccess={handleSuccess}
            onBack={handleBackFromPreview}
          />
        )}
      </div>
    </div>
  )
}
