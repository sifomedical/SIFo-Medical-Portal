'use client'

import { useState, useEffect } from 'react'
import AttachmentUpload from './AttachmentUpload'
import AttachmentList from './AttachmentList'
import { Paperclip } from 'lucide-react'

interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  url: string
  uploadedBy?: string
  createdAt?: string
}

interface AttachmentSectionProps {
  processId: string
  isAdmin?: boolean
}

export default function AttachmentSection({
  processId,
  isAdmin = false,
}: AttachmentSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load attachments on mount
  useEffect(() => {
    loadAttachments()
  }, [processId])

  const loadAttachments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/attachments?processId=${processId}`)

      if (!response.ok) {
        throw new Error('Failed to load attachments')
      }

      const { attachments: data } = await response.json()
      setAttachments(data || [])
    } catch (err) {
      console.error('Error loading attachments:', err)
      setError('Fehler beim Laden der Anhänge')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadSuccess = (attachment: Attachment) => {
    setAttachments((prev) => [attachment, ...prev])
  }

  const handleDeleteSuccess = async (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))

    // Also delete from database
    try {
      const response = await fetch('/api/attachments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId }),
      })

      if (!response.ok) {
        console.error('Failed to delete attachment from database')
      }
    } catch (err) {
      console.error('Error deleting attachment:', err)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Anhänge ({attachments.length})
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Upload Section - only for admins for now */}
        {isAdmin && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Neue Datei hochladen</h3>
            <AttachmentUpload
              processId={processId}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}

        {/* Attachments List */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">
            {attachments.length === 0 ? 'Keine Anhänge' : 'Hochgeladene Dateien'}
          </h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Anhänge werden geladen...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <AttachmentList
              attachments={attachments}
              isAdmin={isAdmin}
              onDeleteSuccess={handleDeleteSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
