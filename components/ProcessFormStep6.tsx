'use client'

import { Process } from '@/types/process'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ProcessFormStep6Props {
  data: Partial<Process>
  isSubmitting?: boolean
  onSubmit: () => void
}

export default function ProcessFormStep6({
  data,
  isSubmitting = false,
  onSubmit,
}: ProcessFormStep6Props) {
  // Validation check
  const isValid = {
    title: Boolean(data.title?.trim()),
    subtitle: Boolean(data.subtitle?.trim()),
    category: Boolean(data.category),
    description: Boolean(data.description?.trim()),
    purpose: Boolean(data.purpose?.trim()),
    scope: Boolean(data.scope?.trim()),
    goals: (data.goals?.length || 0) > 0,
    steps: (data.steps?.length || 0) > 0,
    tools: (data.tools?.length || 0) > 0,
  }

  const allValid = Object.values(isValid).every(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">
          Überprüfung & Zusammenfassung
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Bitte überprüfen Sie alle Eingaben. Der Prozess kann nach der Einreichung nur
          noch von Administratoren bearbeitet werden.
        </p>
      </div>

      {/* Validation Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900 mb-3">Erforderliche Felder:</h4>

        {Object.entries(isValid).map(([field, valid]) => {
          const labels: Record<string, string> = {
            title: 'Prozess-Titel',
            subtitle: 'Untertitel',
            category: 'Kategorie',
            description: 'Beschreibung',
            purpose: 'Zweck (Purpose)',
            scope: 'Umfang (Scope)',
            goals: 'Ziele (mind. 1)',
            steps: 'Prozess-Schritte (mind. 1)',
            tools: 'Tools & Systeme (mind. 1)',
          }

          return (
            <div key={field} className="flex items-center gap-2">
              {valid ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span className={valid ? 'text-gray-700' : 'text-red-600'}>
                {labels[field]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Process Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-blue-900 mb-2">Prozess-Übersicht:</h4>

        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Titel:</strong> {data.title}
          </p>
          <p>
            <strong>Kategorie:</strong> {data.category}
          </p>
          <p>
            <strong>Ziele:</strong> {data.goals?.length || 0} Ziel(e)
          </p>
          <p>
            <strong>Schritte:</strong> {data.steps?.length || 0} Schritt(e)
          </p>
          <p>
            <strong>Tools:</strong> {data.tools?.length || 0} Tool(e)
          </p>
          {data.tags && data.tags.length > 0 && (
            <p>
              <strong>Tags:</strong> {data.tags.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={!allValid || isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            allValid
              ? isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '🕐 Wird eingereicht...' : '✓ Prozess einreichen'}
        </button>
      </div>

      {!allValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Hinweis:</strong> Alle erforderlichen Felder müssen ausgefüllt sein, um
            den Prozess einzureichen.
          </p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          💡 Nach der Einreichung wird Ihr Prozess an die Administratoren zur Überprüfung und
          Genehmigung weitergeleitet. Sie werden per E-Mail benachrichtigt, wenn der Prozess
          genehmigt oder Überarbeitungen erforderlich sind.
        </p>
      </div>
    </div>
  )
}
