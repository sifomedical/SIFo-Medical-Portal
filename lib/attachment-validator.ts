export type AllowedFileType = 'pdf' | 'image' | 'document' | 'video' | 'other'

const ALLOWED_TYPES: Record<string, AllowedFileType> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface ValidationResult {
  valid: boolean
  error?: string
  fileType?: AllowedFileType
}

export function validateFile(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Datei ist zu groß. Maximum: 10MB, deine Datei: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Check file type
  const fileType = ALLOWED_TYPES[file.type]
  if (!fileType) {
    return {
      valid: false,
      error: `Dateityp nicht unterstützt. Erlaubte Typen: PDF, Bilder (JPG, PNG, WebP, GIF), Office-Dateien (Word, Excel, PowerPoint), Videos (MP4, WebM)`,
    }
  }

  return {
    valid: true,
    fileType,
  }
}

export function getFileIcon(fileType: AllowedFileType): string {
  switch (fileType) {
    case 'pdf':
      return '📄'
    case 'image':
      return '🖼️'
    case 'document':
      return '📋'
    case 'video':
      return '🎬'
    default:
      return '📎'
  }
}

export function getFileTypeLabel(fileType: AllowedFileType): string {
  switch (fileType) {
    case 'pdf':
      return 'PDF'
    case 'image':
      return 'Bild'
    case 'document':
      return 'Dokument'
    case 'video':
      return 'Video'
    default:
      return 'Datei'
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
