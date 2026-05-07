'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { validateFile, formatFileSize } from '@/lib/attachment-validator'
import { uploadFile } from '@/lib/supabase-storage'

interface AttachmentUploadProps {
  processId: string
  onUploadSuccess?: (attachment: any) => void
  maxFiles?: number
}

export default function AttachmentUpload({
  processId,
  onUploadSuccess,
  maxFiles = 10,
}: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setError(null)
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(`${file.name}: ${validation.error}`)
        setIsUploading(false)
        return
      }

      try {
        setUploadProgress(`${i + 1}/${files.length}: ${file.name}`)

        // Upload file
        const result = await uploadFile(file, processId, validation.fileType!)

        if (!result.success) {
          setError(`${file.name}: ${result.error}`)
          setIsUploading(false)
          return
        }

        // Save attachment metadata to database
        const dbResponse = await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId,
            fileName: file.name,
            fileType: validation.fileType,
            fileSize: file.size,
            storagePath: result.path,
          }),
        })

        if (!dbResponse.ok) {
          setError(`${file.name}: Database save failed`)
          setIsUploading(false)
          return
        }

        // Call callback
        if (onUploadSuccess) {
          const { attachment } = await dbResponse.json()
          onUploadSuccess(attachment)
        }
      } catch (err) {
        setError(`Fehler bei ${file.name}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`)
        setIsUploading(false)
        return
      }
    }

    setUploadProgress(null)
    setIsUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Drag-Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-[#1B3A6B] bg-blue-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">
              {isUploading ? 'Wird hochgeladen...' : 'Dateien hier ablegen'}
            </p>
            <p className="text-sm text-gray-500">
              oder klicken zum Auswählen (Max 10MB pro Datei)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin">
            <Upload className="w-4 h-4 text-[#1B3A6B]" />
          </div>
          <span className="text-sm text-gray-700">{uploadProgress}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-600">Upload fehlgeschlagen</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Supported Types Info */}
      <p className="text-xs text-gray-500">
        Unterstützte Typen: PDF, Bilder (JPG, PNG, WebP, GIF), Office-Dateien, Videos (MP4, WebM)
      </p>
    </div>
  )
}
