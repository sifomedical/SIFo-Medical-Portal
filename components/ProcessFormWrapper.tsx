'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Process, ProcessStep, CategoryId } from '@/types/process'
import ProcessFormStep1 from './ProcessFormStep1'
import ProcessFormStep2 from './ProcessFormStep2'
import ProcessFormStep3ProcessSteps from './ProcessFormStep3ProcessSteps'
import ProcessFormStep4 from './ProcessFormStep4'
import ProcessFormStep5 from './ProcessFormStep5'
import ProcessFormStep6 from './ProcessFormStep6'
import ProcessFormStepper from './ProcessFormStepper'
import { sendNotification } from '@/lib/notifications'

const STEPS = [
  { id: 1, label: '1', title: 'Grundlagen' },
  { id: 2, label: '2', title: 'Rollen & Definitionen' },
  { id: 3, label: '3', title: 'Prozess-Schritte' },
  { id: 4, label: '4', title: 'Risiken & Outputs' },
  { id: 5, label: '5', title: 'Tools & Dateien' },
  { id: 6, label: '6', title: 'Überprüfung' },
]

interface ProcessFormWrapperProps {
  initialData?: Partial<Process>
  onSuccess?: (processId: string) => void
  showBackButton?: boolean
  onBack?: () => void
}

export default function ProcessFormWrapper({
  initialData,
  onSuccess,
  showBackButton = false,
  onBack,
}: ProcessFormWrapperProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Process>>(
    initialData || {
      title: '',
      subtitle: '',
      category: 'marketing' as CategoryId,
      description: '',
      purpose: '',
      scope: '',
      responsibilities: [],
      definitions: {},
      inputs: [],
      steps: [
        { id: 'step-1', title: '', description: '' },
        { id: 'step-2', title: '', description: '' },
      ],
      risksAndControls: [],
      outputs: [],
      records: [],
      tools: [{ name: '', icon: '🛠️' }],
      processVideoUrl: '',
      tags: [],
      owner: '',
      frequency: '',
      goals: [],
      mermaidDiagram: '',
    }
  )

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    switch (step) {
      case 1:
        if (!formData.title?.trim()) errors.push('Title required')
        if (!formData.subtitle?.trim()) errors.push('Subtitle required')
        if (!formData.category) errors.push('Category required')
        if (!formData.description?.trim()) errors.push('Description required')
        if (!formData.purpose?.trim()) errors.push('Purpose required')
        if (!formData.scope?.trim()) errors.push('Scope required')
        break
      case 2:
        if (!formData.responsibilities || formData.responsibilities.length === 0)
          errors.push('At least one responsibility required')
        if (!formData.definitions || Object.keys(formData.definitions).length === 0)
          errors.push('At least one definition required')
        if (!formData.inputs || formData.inputs.length === 0)
          errors.push('At least one input required')
        break
      case 3:
        if (!formData.steps || formData.steps.length < 2)
          errors.push('At least 2 steps required')
        break
      case 4:
        if (!formData.risksAndControls || formData.risksAndControls.length === 0)
          errors.push('At least one risk/control pair required')
        if (!formData.outputs || formData.outputs.length === 0)
          errors.push('At least one output required')
        if (!formData.records || formData.records.length === 0)
          errors.push('At least one record required')
        break
      case 5:
        if (!formData.owner?.trim()) errors.push('Owner required')
        if (!formData.frequency?.trim()) errors.push('Frequency required')
        if (!formData.tags || formData.tags.length < 2)
          errors.push('At least 2 tags required')
        if (!formData.tools || formData.tools.length === 0)
          errors.push('At least one tool required')
        break
      case 6:
        // Final validation - all previous steps
        const allErrors: string[] = []
        if (!formData.title?.trim()) allErrors.push('Title required')
        if (!formData.subtitle?.trim()) allErrors.push('Subtitle required')
        if (!formData.category) allErrors.push('Category required')
        if (!formData.description?.trim()) allErrors.push('Description required')
        if (!formData.purpose?.trim()) allErrors.push('Purpose required')
        if (!formData.scope?.trim()) allErrors.push('Scope required')
        if (!formData.responsibilities || formData.responsibilities.length === 0)
          allErrors.push('Responsibilities required')
        if (!formData.definitions || Object.keys(formData.definitions).length === 0)
          allErrors.push('Definitions required')
        if (!formData.inputs || formData.inputs.length === 0)
          allErrors.push('Inputs required')
        if (!formData.steps || formData.steps.length < 2)
          allErrors.push('Steps required')
        if (!formData.risksAndControls || formData.risksAndControls.length === 0)
          allErrors.push('Risks required')
        if (!formData.outputs || formData.outputs.length === 0)
          allErrors.push('Outputs required')
        if (!formData.records || formData.records.length === 0)
          allErrors.push('Records required')
        if (!formData.owner?.trim()) allErrors.push('Owner required')
        if (!formData.frequency?.trim()) allErrors.push('Frequency required')
        if (!formData.tags || formData.tags.length < 2)
          allErrors.push('Tags required')
        if (!formData.tools || formData.tools.length === 0)
          allErrors.push('Tools required')
        return { valid: allErrors.length === 0, errors: allErrors }
    }

    return { valid: errors.length === 0, errors }
  }

  const canProceed = (): boolean => {
    const validation = validateStep(currentStep)
    return validation.valid
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 6) {
      setCurrentStep(currentStep + 1)
      setError(null)
    } else if (!canProceed()) {
      setError('Bitte füllen Sie alle erforderlichen Felder aus')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    } else if (currentStep === 1 && showBackButton && onBack) {
      onBack()
    }
  }

  const handleStepClick = (step: number) => {
    // Only allow clicking on already visited steps or next step if current is valid
    if (step < currentStep || (step === currentStep + 1 && canProceed())) {
      setCurrentStep(step)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    const validation = validateStep(6)
    if (!validation.valid) {
      setError('Bitte füllen Sie alle erforderlichen Felder aus')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create draft process
      const response = await fetch('/api/processes/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'draft',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create process')
      }

      const { id, slug } = await response.json()

      // Send notification to admins
      const processUrl = `/marketing/${slug}`
      await sendNotification('draft_created', {
        to: 'admin@sifo-medical.com',
        processTitle: formData.title || 'Neuer Prozess',
        processUrl,
      })

      if (onSuccess) {
        onSuccess(id)
      } else {
        router.push(`/admin/processes/${id}`)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Fehler beim Einreichen des Prozesses'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ProcessFormStepper
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">⚠️ {error}</p>
          </div>
        )}

        {currentStep === 1 && (
          <ProcessFormStep1
            data={formData as any}
            onChange={handleChange}
            onValidate={() => validateStep(1)}
          />
        )}
        {currentStep === 2 && (
          <ProcessFormStep2
            data={formData as any}
            onChange={handleChange}
            onValidate={() => validateStep(2)}
          />
        )}
        {currentStep === 3 && (
          <ProcessFormStep3ProcessSteps
            data={formData as any}
            onChange={handleChange}
            onValidate={() => validateStep(3)}
          />
        )}
        {currentStep === 4 && (
          <ProcessFormStep4
            data={formData as any}
            onChange={handleChange}
            onValidate={() => validateStep(4)}
          />
        )}
        {currentStep === 5 && (
          <ProcessFormStep5
            data={formData as any}
            onChange={handleChange}
            onValidate={() => validateStep(5)}
          />
        )}
        {currentStep === 6 && (
          <ProcessFormStep6
            data={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {currentStep < 6 && (
        <div className="flex gap-3 mt-8 justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 && !showBackButton}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ← Zurück
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            Weiter →
          </button>
        </div>
      )}
    </div>
  )
}
