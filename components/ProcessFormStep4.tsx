'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface RiskControl {
  risk: string
  control: string
}

interface Step4Data {
  risksAndControls: RiskControl[]
  outputs: string[]
  records: string[]
}

interface ProcessFormStep4Props {
  data: Step4Data
  onChange: (field: keyof Step4Data, value: RiskControl[] | string[]) => void
  onValidate: () => { valid: boolean; errors: string[] }
}

export default function ProcessFormStep4({
  data,
  onChange,
  onValidate,
}: ProcessFormStep4Props) {
  const [newRisk, setNewRisk] = useState('')
  const [newControl, setNewControl] = useState('')
  const [newOutput, setNewOutput] = useState('')
  const [newRecord, setNewRecord] = useState('')

  const validation = onValidate()
  const isRisksValid = (data.risksAndControls?.length || 0) > 0
  const isOutputsValid = (data.outputs?.length || 0) > 0
  const isRecordsValid = (data.records?.length || 0) > 0

  const handleAddRisk = () => {
    if (newRisk.trim() && newControl.trim()) {
      onChange('risksAndControls', [
        ...(data.risksAndControls || []),
        { risk: newRisk.trim(), control: newControl.trim() },
      ])
      setNewRisk('')
      setNewControl('')
    }
  }

  const handleRemoveRisk = (index: number) => {
    const updated = (data.risksAndControls || []).filter((_, i) => i !== index)
    onChange('risksAndControls', updated)
  }

  const handleAddOutput = () => {
    if (newOutput.trim()) {
      onChange('outputs', [...(data.outputs || []), newOutput.trim()])
      setNewOutput('')
    }
  }

  const handleRemoveOutput = (index: number) => {
    const updated = (data.outputs || []).filter((_, i) => i !== index)
    onChange('outputs', updated)
  }

  const handleAddRecord = () => {
    if (newRecord.trim()) {
      onChange('records', [...(data.records || []), newRecord.trim()])
      setNewRecord('')
    }
  }

  const handleRemoveRecord = (index: number) => {
    const updated = (data.records || []).filter((_, i) => i !== index)
    onChange('records', updated)
  }

  return (
    <div className="space-y-6">
      {/* Risks & Controls */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Risiken & Kontrollen (mind. 1) *{' '}
          {isRisksValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Welche Risiken können auftreten und wie werden sie kontrolliert/vermieden?
        </p>

        {/* Input for new risk control pair */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRisk}
            onChange={(e) => setNewRisk(e.target.value)}
            placeholder="z.B. Tippfehler"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <input
            type="text"
            value={newControl}
            onChange={(e) => setNewControl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRisk()}
            placeholder="z.B. Spell-Check vor Publish"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddRisk}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of risk control pairs */}
        {(data.risksAndControls || []).length > 0 ? (
          <div className="space-y-2">
            {data.risksAndControls.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <div className="text-sm">
                  <span className="font-semibold text-red-700">Risiko:</span>{' '}
                  <span className="text-gray-800">{item.risk}</span>
                  <br />
                  <span className="font-semibold text-emerald-700">Kontrolle:</span>{' '}
                  <span className="text-gray-800">{item.control}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRisk(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isRisksValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens ein Risiko-Kontroll-Paar erforderlich</p>
          )
        )}
      </div>

      {/* Outputs */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ergebnisse / Outputs (mind. 1) *{' '}
          {isOutputsValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Was sind die Ergebnisse/Outputs dieses Prozesses? z.B. "Veröffentlichter Blogpost", "Performance Report"
        </p>

        {/* Input for new output */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newOutput}
            onChange={(e) => setNewOutput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddOutput()}
            placeholder="z.B. Veröffentlichter Blogpost"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddOutput}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of outputs */}
        {(data.outputs || []).length > 0 ? (
          <div className="space-y-2">
            {data.outputs.map((output, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <span className="text-gray-800">{output}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOutput(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isOutputsValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens ein Output erforderlich</p>
          )
        )}
      </div>

      {/* Records */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Aufzeichnungen / Record-Typen (mind. 1) *{' '}
          {isRecordsValid && <span className="text-green-600">✓</span>}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Welche Aufzeichnungen/Daten müssen dokumentiert oder archiviert werden?
          z.B. "Google Analytics tracking", "Editorial Calendar"
        </p>

        {/* Input for new record */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRecord}
            onChange={(e) => setNewRecord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRecord()}
            placeholder="z.B. Google Analytics tracking"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A68B] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddRecord}
            className="px-4 py-2 bg-[#00A68B] text-white rounded-lg hover:bg-[#008B6F] font-medium"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of records */}
        {(data.records || []).length > 0 ? (
          <div className="space-y-2">
            {data.records.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <span className="text-gray-800">{record}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecord(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isRecordsValid && !validation.valid && (
            <p className="text-sm text-red-600 mt-2">⚠️ Mindestens ein Record-Typ erforderlich</p>
          )
        )}
      </div>

      {/* Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tipp:</strong> Step 4 dokumentiert die Qualitätssicherung (Risiken), die
          erwarteten Ergebnisse (Outputs), und die Nachweise (Records). Dies ist wichtig für
          Compliance und Monitoring.
        </p>
      </div>
    </div>
  )
}
