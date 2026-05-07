'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/types/process'
import { CategoryId, Process } from '@/types/process'
import AIProcessGenerator from '@/components/AIProcessGenerator'
import ProcessPreviewForm from '@/components/ProcessPreviewForm'
import { ChevronRight } from 'lucide-react'

type Step = 'category' | 'input' | 'preview'

export default function CreateProcessPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [generatedProcess, setGeneratedProcess] = useState<Partial<Process> | null>(null)

  const handleCategorySelect = (category: CategoryId) => {
    setSelectedCategory(category)
    setStep('input')
  }

  const handleGenerateProcess = (processData: Partial<Process>) => {
    setGeneratedProcess(processData)
    setStep('preview')
  }

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  const handleBackFromInput = () => {
    setSelectedCategory(null)
    setStep('category')
  }

  const handleBackFromPreview = () => {
    setGeneratedProcess(null)
    setStep('input')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F6F7] to-white py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        {step === 'category' && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-2">
              ✨ Neuen Prozess erstellen
            </h1>
            <p className="text-[#6A7A8B]">
              Beschreibe deinen Prozess per Sprache oder Text. Die KI generiert automatisch alle
              Dokumentationen.
            </p>
          </div>
        )}

        {step === 'input' && (
          <div className="mb-8">
            <button
              onClick={handleBackFromInput}
              className="mb-4 flex items-center gap-1 text-sm text-[#00A68B] hover:text-[#008B72]"
            >
              ← Zurück zur Kategorie-Auswahl
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C2340] mb-1">
                {selectedCategory && CATEGORIES.find((c) => c.id === selectedCategory)?.title}
              </h1>
              <p className="text-[#6A7A8B]">Schritt 1 von 2 - Prozess beschreiben</p>
            </div>
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

        {/* Step 0: Category Selection */}
        {step === 'category' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`group rounded-lg border-2 p-6 text-left transition-all hover:border-[#00A68B] hover:bg-[#00A68B]/5 ${
                  category.borderColor
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-[#0C2340] text-lg mb-1">{category.title}</h3>
                    <p className="text-sm text-[#6A7A8B]">{category.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#6A7A8B] group-hover:text-[#00A68B] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Voice/Text Input */}
        {step === 'input' && selectedCategory && (
          <AIProcessGenerator
            category={selectedCategory}
            onGenerate={handleGenerateProcess}
            onBack={handleBackFromInput}
          />
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
