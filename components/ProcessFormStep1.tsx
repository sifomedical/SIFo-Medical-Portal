'use client'

import { ChangeEvent } from 'react'

const CATEGORIES = ['marketing', 'sales', 'operations', 'hr', 'quality', 'finance']

interface Step1Data {
  title: string
  subtitle: string
  description: string
  purpose: string
  scope: string
}

interface ProcessFormStep1Props {
  data: Step1Data
  onChange: (field: keyof Step1Data, value: string) => void
  onValidate: () => { valid: boolean; errors: string[] }
}

export default function ProcessFormStep1({
  data,
  onChange,
  onValidate,
}: ProcessFormStep1Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    onChange(name as keyof Step1Data, value)
  }

  const validation = onValidate()
  const isTitleValid = Boolean(data.title?.trim())
  const isSubtitleValid = Boolean(data.subtitle?.trim())
  const isDescriptionValid = Boolean(data.description?.trim())
  const isPurposeValid = Boolean(data.purpose?.trim())
  const isScopeValid = Boolean(data.scope?.trim())

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prozess-Titel * {isTitleValid && <span className="text-green-600">✓</span>}
        </label>
        <input
          type="text"
          name="title"
          value={data.title || ''}
          onChange={handleChange}
          placeholder="z.B. Google Ads Campaign Setup"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !isTitleValid && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {!isTitleValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Der Titel ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kurzer Untertitel (1-3 Worte) * {isSubtitleValid && <span className="text-green-600">✓</span>}
        </label>
        <input
          type="text"
          name="subtitle"
          value={data.subtitle || ''}
          onChange={handleChange}
          placeholder="z.B. Setup und Launch"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !isSubtitleValid && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {!isSubtitleValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Der Untertitel ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Beschreibung * {isDescriptionValid && <span className="text-green-600">✓</span>}
        </label>
        <textarea
          name="description"
          value={data.description || ''}
          onChange={handleChange}
          placeholder="Detaillierte Beschreibung des Prozesses..."
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent resize-none ${
            !isDescriptionValid && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {!isDescriptionValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Die Beschreibung ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Zweck (Purpose) * {isPurposeValid && <span className="text-green-600">✓</span>}
        </label>
        <textarea
          name="purpose"
          value={data.purpose || ''}
          onChange={handleChange}
          placeholder="Was ist der Hauptzweck dieses Prozesses? Was soll erreicht werden?"
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent resize-none ${
            !isPurposeValid && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {!isPurposeValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Der Zweck ist erforderlich</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Umfang (Scope) * {isScopeValid && <span className="text-green-600">✓</span>}
        </label>
        <textarea
          name="scope"
          value={data.scope || ''}
          onChange={handleChange}
          placeholder="Wer ist betroffen? Was ist abgedeckt? Gibt es Ausnahmen?"
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent resize-none ${
            !isScopeValid && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {!isScopeValid && !validation.valid && (
          <p className="text-sm text-red-600 mt-1">⚠️ Der Umfang ist erforderlich</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Alle Felder auf dieser Seite sind erforderlich. Sie bilden
          die Grundlage für die nächsten Schritte.
        </p>
      </div>
    </div>
  )
}
