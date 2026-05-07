'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import ProcessFormWrapper from './ProcessFormWrapper'
import { Process } from '@/types/process'

interface ProcessPreviewFormProps {
  initialProcess: Partial<Process>
  onSuccess: () => void
  onBack: () => void
}

export default function ProcessPreviewForm({
  initialProcess,
  onSuccess,
  onBack,
}: ProcessPreviewFormProps) {
  const [warning, setWarning] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!initialProcess.title || !initialProcess.category) {
      setWarning('Titel und Kategorie sind erforderlich.')
      return
    }

    try {
      const response = await fetch('/api/processes/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialProcess),
      })

      if (!response.ok) {
        const error = await response.json()
        setWarning(error.error || 'Fehler beim Speichern')
        return
      }

      onSuccess()
    } catch (error) {
      setWarning('Fehler beim Speichern des Prozesses')
    }
  }

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div className="rounded-lg border border-[#00A68B]/20 bg-[#00A68B]/5 p-4">
        <p className="text-sm font-semibold text-[#0C2340]">
          📋 Überprüfe und bearbeite deinen Prozess
        </p>
        <p className="mt-2 text-sm text-[#6A7A8B]">
          Die KI hat den Prozess aus deiner Beschreibung generiert. Du kannst alle Felder noch
          bearbeiten, bevor du ihn als Entwurf speicherst.
        </p>
      </div>

      {/* Warning Message */}
      {warning && (
        <div className="flex gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">{warning}</p>
        </div>
      )}

      {/* Form */}
      <ProcessFormWrapper
        initialData={initialProcess}
        onSuccess={onSuccess}
        showBackButton={true}
        onBack={onBack}
      />
    </div>
  )
}
