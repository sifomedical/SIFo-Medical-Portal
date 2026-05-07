'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadProcessPdf } from '@/lib/pdf-generator'

interface ProcessExporterProps {
  process: {
    title: string
    subtitle?: string
    description?: string
    category?: string
    owner?: string
    frequency?: string
    goals?: string[]
    tools?: Array<{ name: string; url?: string }>
    tags?: string[]
    mermaidDiagram?: string
    lastUpdated?: string
  }
}

export default function ProcessExporter({ process }: ProcessExporterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await downloadProcessPdf(process)
    } catch (err) {
      console.error('PDF generation failed:', err)
      setError('PDF-Download fehlgeschlagen. Versuche es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B3A6B] hover:bg-[#152B54] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        {isLoading ? 'PDF wird erstellt...' : 'Als PDF herunterladen'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
