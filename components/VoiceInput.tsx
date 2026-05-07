'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, AlertCircle, Loader } from 'lucide-react'

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void
  isDisabled?: boolean
}

export default function VoiceInput({ onTranscriptChange, isDisabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const maxRecordingDuration = 120

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined'

    if (!SpeechRecognition || !hasMediaRecorder) {
      setIsBrowserSupported(false)
      return
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    setTranscript('')
    audioChunksRef.current = []
    setRecordingTime(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, chunks:', audioChunksRef.current.length)
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('Audio blob created, size:', audioBlob.size)
        await transcribeAudio(audioBlob)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.onerror = (event: any) => {
        setError('Fehler beim Aufzeichnen: ' + event.error)
        setIsRecording(false)
      }

      mediaRecorder.start()
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingDuration) {
            stopRecording()
            return maxRecordingDuration
          }
          return prev + 1
        })
      }, 1000)
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Bitte erlaube Mikrophon-Zugriff in den Browsereinstellungen.')
      } else if (err.name === 'NotFoundError') {
        setError('Kein Mikrophon gefunden.')
      } else {
        setError('Fehler beim Zugriff auf Mikrophon: ' + err.message)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setError(null)

    try {
      console.log('Starting transcription with blob size:', audioBlob.size)

      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('language', 'de')

      console.log('Sending to /api/transcribe')
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Transcription result:', data)

      const result = data.text.trim()
      setTranscript(result)
      onTranscriptChange(result)
    } catch (err: any) {
      console.error('Transcription error:', err)
      setError('Fehler bei der Transkription: ' + err.message)
    } finally {
      setIsTranscribing(false)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    onTranscriptChange('')
    setError(null)
  }

  if (!isBrowserSupported) {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm text-orange-800">
          Dein Browser unterstützt Voice-Input nicht. Nutze bitte die Text-Eingabe stattdessen.
        </p>
      </div>
    )
  }

  const minutes = Math.floor(recordingTime / 60)
  const seconds = recordingTime % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="rounded-lg border-2 border-dashed border-[#00A68B]/30 bg-[#00A68B]/5 p-8 text-center">
        {!isRecording && !isTranscribing ? (
          <button
            onClick={startRecording}
            disabled={isDisabled}
            className="mx-auto flex flex-col items-center gap-3 disabled:opacity-50"
          >
            <div className="rounded-full bg-[#00A68B] p-4 text-white transition-transform hover:scale-110 disabled:hover:scale-100">
              <Mic className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-[#0C2340]">Sprachaufnahme starten</p>
              <p className="text-xs text-[#6A7A8B]">Klick um Aufnahme zu starten</p>
            </div>
          </button>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="font-mono text-sm font-semibold text-[#0C2340]">{timeDisplay}</span>
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            </div>
            <p className="text-sm text-[#6A7A8B]">Aufnahme läuft...</p>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              <Square className="h-4 w-4" />
              Stopp
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-[#00A68B]/10 p-4">
              <Loader className="h-8 w-8 animate-spin text-[#00A68B]" />
            </div>
            <p className="font-semibold text-[#0C2340]">Transkribiere Aufnahme...</p>
            <p className="text-xs text-[#6A7A8B]">Dies kann bis zu 30 Sekunden dauern.</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="space-y-2">
          <div className="rounded-lg border border-[#00A68B]/20 bg-[#00A68B]/5 p-4">
            <p className="text-sm text-[#6A7A8B]">Transkript:</p>
            <p className="mt-2 text-[#0C2340]">{transcript}</p>
          </div>
          <button
            onClick={clearTranscript}
            className="text-xs text-[#6A7A8B] hover:text-[#0C2340]"
          >
            Transkript löschen
          </button>
        </div>
      )}
    </div>
  )
}
