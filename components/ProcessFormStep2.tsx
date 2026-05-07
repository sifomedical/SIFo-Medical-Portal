'use client'

import { ChangeEvent, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Step2Data {
  responsibilities: string[]
  definitions: Record<string, string>
  inputs: string[]
}

interface ProcessFormStep2Props {
  data: Step2Data
  onChange: (field: keyof Step2Data, value: string[] | Record<string, string>) => void
  onValidate: () => { valid: boolean; errors: string[] }
}

export default function ProcessFormStep2({
  data,
  onChange,
  onValidate,
}: ProcessFormStep2Props) {
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newDefKey, setNewDefKey] = useState('')
  const [newDefValue, setNewDefValue] = useState('')
  const [newInput, setNewInput] = useState('')

  const validation = onValidate()
  const isResponsibilitiesValid = (data.responsibilities?.length || 0) > 0
  const isDefinitionsValid = Object.keys(data.definitions || {}).length > 0
  const isInputsValid = (data.inputs?.length || 0) > 0

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      onChange('responsibilities', [...(data.responsibilities || []), newResponsibility.trim()])
      setNewResponsibility('')
    }
  }

  const handleRemoveResponsibility = (index: number) => {
    const updated = (data.responsibilities || []).filter((_, i) => i !== index)
    onChange('responsibilities', updated)
  }

  const handleAddDefinition = () => {
    if (newDefKey.trim() && newDefValue.trim()) {
      const updated = { ...(data.definitions || {}) }
      updated[newDefKey.trim()] = newDefValue.trim()
      onChange('definitions', updated)
      setNewDefKey('')
      setNewDefValue('')
    }
  }

  const handleRemoveDefinition = (key: string) => {
    const updated = { ...(data.definitions || {}) }
    delete updated[key]
    onChange('definitions', updated)
  }

  const handleAddInput = () => {
    if (newInput.trim()) {
      onChange('inputs', [...(data.inputs || []), newInput.trim()])
      setNewInput('')
    }
  }

  const handleRemoveInput = (index: number) => {
    const updated = (data.inputs || []).filter((_, i) => i !== index)
    onChange('inputs', updated)
  }

  return (
    <div className="space-y-6">
      {/* Responsibilities */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Verantwortlichkeiten (mind. 1) *{' '}
          {isResponsibilitiesValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Wer ist verantwortlich für welchen Teil? z.B. "John: Campaign Setup", "Sarah: Approval"
        </p>

        {/* Input for new responsibility */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newResponsibility}
            onChange={(e) => setNewResponsibility(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddResponsibility()}
            placeholder="z.B. John: Campaign Setup"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddResponsibility}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of responsibilities */}
        {(data.responsibilities || []).length > 0 ? (
          <div className="space-y-2">
            {data.responsibilities.map((resp, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <span className="text-gray-800">{resp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveResponsibility(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isResponsibilitiesValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens eine Verantwortlichkeit erforderlich</p>
          )
        )}
      </div>

      {/* Definitions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Begriffsdefinitionen (mind. 1) *{' '}
          {isDefinitionsValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Wichtige Begriffe und Abkürzungen erklären. z.B. "CPC" = "Cost Per Click"
        </p>

        {/* Input for new definition */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newDefKey}
            onChange={(e) => setNewDefKey(e.target.value)}
            placeholder="Begriff / Abkürzung"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <input
            type="text"
            value={newDefValue}
            onChange={(e) => setNewDefValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddDefinition()}
            placeholder="Bedeutung"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddDefinition}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of definitions */}
        {Object.keys(data.definitions || {}).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(data.definitions || {}).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <div>
                  <span className="font-semibold text-gray-900">{key}</span>
                  <span className="text-gray-600 mx-2">=</span>
                  <span className="text-gray-700">{value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDefinition(key)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isDefinitionsValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens eine Definition erforderlich</p>
          )
        )}
      </div>

      {/* Inputs */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Eingaben / Input-Materialien (mind. 1) *{' '}
          {isInputsValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Was wird benötigt, um diesen Prozess zu starten? z.B. "Blog post in Notion", "SEO keywords"
        </p>

        {/* Input for new input item */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddInput()}
            placeholder="z.B. Blog post draft"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddInput}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of inputs */}
        {(data.inputs || []).length > 0 ? (
          <div className="space-y-2">
            {data.inputs.map((input, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <span className="text-gray-800">{input}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInput(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isInputsValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens ein Input-Element erforderlich</p>
          )
        )}
      </div>

      {/* Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Step 2 dokumentiert wer involviert ist, welche Begriffe wichtig
          sind, und was benötigt wird. Diese Informationen helfen späteren Lesern, den Prozess
          schnell zu verstehen.
        </p>
      </div>
    </div>
  )
}
