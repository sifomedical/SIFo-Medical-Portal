'use client'

import { useState } from 'react'
import { Trash2, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CategoryId } from '@/types/process'

interface ProcessDetailActionsProps {
  slug: string
  title: string
  isArchived: boolean
  category: CategoryId
}

export default function ProcessDetailActions({
  slug,
  title,
  isArchived,
  category,
}: ProcessDetailActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
      router.push(`/${category}`)
      router.refresh()
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
      router.refresh()
    } catch (error) {
      alert('❌ ' + (error instanceof Error ? error.message : 'Error'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isArchived) {
    return (
      <button
        onClick={handleRestore}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      Löschen
    </button>
  )
}
