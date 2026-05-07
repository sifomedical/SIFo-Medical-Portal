import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import OpenAI from 'openai'
import { Readable } from 'stream'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as Blob
    const language = (formData.get('language') as string) || 'de'

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    console.log('[Transcribe] Received file:', { size: file.size, type: file.type })

    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    const transcription = await openai.audio.transcriptions.create({
      file: new File([uint8Array], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: language,
    } as any)

    console.log('[Transcribe] Result:', transcription)

    return NextResponse.json({
      text: transcription.text,
    })
  } catch (error: any) {
    console.error('[Transcribe] Error:', error)

    let errorMessage = 'Fehler bei der Transkription'
    let statusCode = 500

    if (error.status) {
      statusCode = error.status
    }

    if (error.error?.message) {
      errorMessage = error.error.message
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
