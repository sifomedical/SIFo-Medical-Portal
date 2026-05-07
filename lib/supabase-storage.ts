import { createClient } from '@supabase/supabase-js'
import { AllowedFileType } from './attachment-validator'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = 'process-attachments'

export interface UploadResult {
  success: boolean
  error?: string
  path?: string
  url?: string
}

export async function uploadFile(
  file: File,
  processId: string,
  fileType: AllowedFileType
): Promise<UploadResult> {
  try {
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${processId}/${fileType}/${fileId}-${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Upload fehlgeschlagen: ${uploadError.message}`,
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

    return {
      success: true,
      path: storagePath,
      url: publicUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: `Fehler beim Upload: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
    }
  }
}

export async function deleteFile(storagePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

export async function getPublicUrl(storagePath: string): Promise<string> {
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)
  return publicUrl
}
