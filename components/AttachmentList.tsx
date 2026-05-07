'use client'

import { useState } from 'react'
import { Download, Trash2, ExternalLink } from 'lucide-react'
import { getFileIcon, formatFileSize } from '@/lib/attachment-validator'
import { deleteFile } from '@/lib/supabase-storage'

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

interface AttachmentListProps {
  attachments: Attachment[]
  isAdmin?: boolean
  onDeleteSuccess?: (id: string) => void
}

export default function AttachmentList({
  attachments,
  isAdmin = false,
  onDeleteSuccess,
}: AttachmentListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Keine Anhänge vorhanden</p>
      </div>
    )
  }

  const handleDelete = async (attachment: Attachment) => {
    if (!window.confirm(`Datei "${attachment.fileName}" wirklich löschen?`)) {
      return
    }

    try {
      setIsDeleting(attachment.id)
      const success = await deleteFile(attachment.storagePath)

      if (success) {
        onDeleteSuccess?.(attachment.id)
      } else {
        alert('Fehler beim Löschen der Datei')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Fehler beim Löschen der Datei')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0">
              {getFileIcon(attachment.fileType as any)}
            </span>
            <div className="min-w-0 flex-1">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#1B3A6B] hover:underline truncate block"
              >
                {attachment.fileName}
              </a>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.fileSize)}
                {attachment.uploadedBy && ` • Uploaded by ${attachment.uploadedBy}`}
                {attachment.createdAt && ` • ${new Date(attachment.createdAt).toLocaleDateString('de-AT')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-[#1B3A6B] transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>

            {isAdmin && (
              <button
                onClick={() => handleDelete(attachment)}
                disabled={isDeleting === attachment.id}
                className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete"
              >
                {isDeleting === attachment.id ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
