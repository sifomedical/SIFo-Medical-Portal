'use client'

import { useState } from 'react'
import { Trash2, RotateCcw } from 'lucide-react'

interface ProcessDeleteButtonProps {
  slug: string
  title: string
  isArchived: boolean
  onSuccess?: () => void
  size?: 'sm' | 'md'
}

export default function ProcessDeleteButton({
  slug,
  title,
  isArchived,
  onSuccess,
  size = 'md',
}: ProcessDeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Prozess "${title}" archivieren?`)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/processes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'archive' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to archive')
      }

      alert('✅ Prozess archiviert')
      onSuccess?.()
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!confirm(`Prozess "${title}" wiederherstellen?`)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/processes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'restore' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore')
      }

      alert('✅ Prozess wiederhergestellt')
      onSuccess?.()
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Error'))
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'

  if (isArchived) {
    return (
      <button
        onClick={handleRestore}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 ${sizeClasses} bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50`}
      >
        <RotateCcw className="w-4 h-4" />
        Wiederherstellen
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className={`inline-flex items-center gap-1 ${sizeClasses} bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50`}
    >
      <Trash2 className="w-4 h-4" />
      Löschen
    </button>
  )
}
