'use client'

import { ChangeEvent, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { ProcessTool, Attachment } from '@/types/process'
import AttachmentSection from './AttachmentSection'

interface Step5Data {
  tools: ProcessTool[]
  attachments?: Attachment[]
  processVideoUrl?: string
  tags: string[]
  goals: string[]
  owner: string
  frequency: string
}

interface ProcessFormStep5Props {
  data: Step5Data
  onChange: (field: string, value: any) => void
  onValidate: () => { valid: boolean; errors: string[] }
  processId?: string
}

export default function ProcessFormStep5({
  data,
  onChange,
  onValidate,
  processId,
}: ProcessFormStep5Props) {
  const [newTag, setNewTag] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const validation = onValidate()
  const isGoalsValid = (data.goals?.length || 0) > 0
  const toolsError = validation.errors.find((e) => e.includes('tools'))
  const ownerError = validation.errors.find((e) => e.includes('owner'))
  const frequencyError = validation.errors.find((e) => e.includes('frequency'))

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  const updateTool = (index: number, field: keyof ProcessTool, value: string) => {
    const newTools = [...data.tools]
    newTools[index] = {
      ...newTools[index],
      [field]: value || undefined,
    }
    onChange('tools', newTools)
  }

  const addTool = () => {
    const newTool: ProcessTool = {
      name: '',
      url: '',
      icon: '🛠️',
    }
    onChange('tools', [...data.tools, newTool])
  }

  const removeTool = (index: number) => {
    const newTools = data.tools.filter((_, i) => i !== index)
    onChange('tools', newTools)
  }

  const addTag = () => {
    if (newTag.trim()) {
      onChange('tags', [...(data.tags || []), newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = (data.tags || []).filter((_, i) => i !== index)
    onChange('tags', newTags)
  }

  const updateTag = (index: number, value: string) => {
    const newTags = [...(data.tags || [])]
    newTags[index] = value
    onChange('tags', newTags)
  }

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onChange('goals', [...(data.goals || []), newGoal.trim()])
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (index: number) => {
    const updated = (data.goals || []).filter((_, i) => i !== index)
    onChange('goals', updated)
  }

  return (
    <div className="space-y-6">
      {/* Owner */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Owner / Verantwortlicher *
        </label>
        <input
          type="text"
          name="owner"
          value={data.owner}
          onChange={handleChange}
          placeholder="z.B. Marketing, Operations, ..."
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !data.owner && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {ownerError && !data.owner && (
          <p className="text-sm text-red-600 mt-1">Der Owner ist erforderlich</p>
        )}
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Häufigkeit / Zeitplan *
        </label>
        <input
          type="text"
          name="frequency"
          value={data.frequency}
          onChange={handleChange}
          placeholder="z.B. jeden Montag, wöchentlich, bei Bedarf, ..."
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent ${
            !data.frequency && !validation.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {frequencyError && !data.frequency && (
          <p className="text-sm text-red-600 mt-1">Die Häufigkeit ist erforderlich</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tags (mind. 1) *{' '}
          {(data.tags || []).length >= 1 && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Schlagwörter zum Auffinden. z.B. "compliance", "onboarding", "reporting"
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            onBlur={addTag}
            placeholder="z.B. compliance, reporting, ..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            onClick={addTag}
            type="button"
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {(data.tags || []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(data.tags || []).map((tag, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm text-gray-700">#{tag}</span>
                <button
                  onClick={() => removeTag(index)}
                  type="button"
                  className="text-gray-400 hover:text-red-600 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !validation.valid && (
            <p className="text-sm text-red-600">⚠️ Mindestens ein Tag erforderlich</p>
          )
        )}
      </div>

      {/* Process Video */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Prozess-Video URL (optional)
        </label>
        <input
          type="url"
          name="processVideoUrl"
          value={data.processVideoUrl || ''}
          onChange={handleChange}
          placeholder="z.B. https://youtube.com/watch?v=..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Link zu YouTube, Vimeo oder ähnlichen Plattformen</p>
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ziele (mind. 1) *{' '}
          {isGoalsValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Was soll mit diesem Prozess erreicht werden? z.B. "Qualität sicherstellen", "Fehler reduzieren"
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
            onBlur={handleAddGoal}
            placeholder="z.B. Qualitätssicherung verbessern"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddGoal}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {(data.goals || []).length > 0 ? (
          <div className="space-y-2">
            {data.goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <span className="text-gray-800">{goal}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isGoalsValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens ein Ziel erforderlich</p>
          )
        )}
      </div>

      {/* Tools & Systeme */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Tools & Systeme (mind. 1) *</label>
            <p className="text-sm text-gray-600">Welche Tools oder Systeme werden in diesem Prozess verwendet?</p>
          </div>
          <button
            onClick={addTool}
            type="button"
            className="flex items-center gap-1 px-3 py-1 bg-[#00A68B] text-white rounded-lg text-sm hover:bg-[#008B6F]"
          >
            <Plus size={16} /> Tool hinzufügen
          </button>
        </div>

        {toolsError && <p className="text-sm text-red-600 mb-3">Du brauchst mindestens 1 Tool</p>}

        <div className="space-y-3">
          {data.tools.map((tool, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tool-Name *</label>
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) => updateTool(index, 'name', e.target.value)}
                    placeholder="z.B. Notion, Google Drive, Odoo..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
                  <input
                    type="text"
                    value={tool.icon || ''}
                    onChange={(e) => updateTool(index, 'icon', e.target.value)}
                    placeholder="z.B. 📋, 🔗, 📊..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
                <input
                  type="url"
                  value={tool.url || ''}
                  onChange={(e) => updateTool(index, 'url', e.target.value)}
                  placeholder="z.B. https://notion.so"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
                />
              </div>

              {data.tools.length > 1 && (
                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <button
                    onClick={() => removeTool(index)}
                    type="button"
                    className="text-sm text-red-600 hover:underline flex items-center gap-1"
                  >
                    <X size={14} /> Entfernen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attachments */}
      {processId && <AttachmentSection processId={processId} />}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Step 5 kombiniert alle technischen Details: Tools, Dateien,
          Videos und Metadaten. Dies macht den Prozess einfach zu finden und zu starten.
        </p>
      </div>
    </div>
  )
}
