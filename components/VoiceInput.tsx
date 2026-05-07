'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, AlertCircle } from 'lucide-react'

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void
  isDisabled?: boolean
}

export default function VoiceInput({ onTranscriptChange, isDisabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptRef = useRef<string>('')
  const maxRecordingDuration = 120

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsBrowserSupported(false)
      return
    }

    recognitionRef.current = new SpeechRecognition()
    const recognition = recognitionRef.current

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'de-DE'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setRecordingTime(0)
      transcriptRef.current = ''
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' '
        } else {
          interimTranscript += transcriptSegment
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript
      }

      const displayText = (transcriptRef.current + interimTranscript).trim()
      setTranscript(displayText)
      onTranscriptChange(displayText)
    }

    recognition.onerror = (event: any) => {
      let errorMessage = 'Spracherkennungsfehler'

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Keine Sprache erkannt. Versuche erneut.'
          break
        case 'network':
          errorMessage = 'Netzwerkfehler. Überprüfe deine Internetverbindung.'
          break
        case 'permission-denied':
          errorMessage = 'Bitte erlaube Mikrophon-Zugriff in den Browsereinstellungen.'
          break
        case 'not-allowed':
          errorMessage = 'Mikrophon-Zugriff wurde verweigert.'
          break
        case 'aborted':
          errorMessage = 'Aufnahme wurde abgebrochen. Versuche erneut.'
          break
        default:
          errorMessage = `Fehler: ${event.error}`
      }

      setError(errorMessage)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [onTranscriptChange])

  const startRecording = () => {
    if (!recognitionRef.current) return

    setTranscript('')
    setError(null)
    setRecordingTime(0)

    recognitionRef.current.start()

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= maxRecordingDuration) {
          stopRecording()
          return maxRecordingDuration
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsListening(false)
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
        {!isListening ? (
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
              <p className="text-xs text-[#6A7A8B]">Klick um Spracherkennung zu starten</p>
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="font-mono text-sm font-semibold text-[#0C2340]">{timeDisplay}</span>
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500 animation-delay-200" />
            </div>
            <p className="text-sm text-[#6A7A8B]">Spreche jetzt...</p>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              <Square className="h-4 w-4" />
              Stopp
            </button>
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
