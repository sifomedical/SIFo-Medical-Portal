import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import OpenAI from 'openai'
import {
  buildGenerationPrompt,
  parseAIResponse,
  validateGeneratedProcess,
  fillMissingDefaults,
} from '@/lib/ai-process-generator'
import { CategoryId } from '@/types/process'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentifizierung erforderlich' }, { status: 401 })
    }

    const { category, userInput, clarifyingAnswers } = await request.json()

    if (!category || !userInput) {
      return NextResponse.json(
        { error: 'Category und userInput sind erforderlich' },
        { status: 400 }
      )
    }

    if (userInput.trim().length < 10) {
      return NextResponse.json(
        { error: 'Bitte beschreibe den Prozess mit mindestens 10 Zeichen' },
        { status: 400 }
      )
    }

    const systemPrompt = buildGenerationPrompt(category as CategoryId, userInput, clarifyingAnswers)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
    })

    const responseText = response.choices[0]?.message?.content || ''

    if (!responseText) {
      return NextResponse.json(
        { error: 'KI hat keine Antwort generiert' },
        { status: 500 }
      )
    }

    const parsed = parseAIResponse(responseText)

    if ('clarifying_questions' in parsed && parsed.clarifying_questions) {
      return NextResponse.json({
        clarifying_questions: parsed.clarifying_questions,
      })
    }

    const validation = validateGeneratedProcess(parsed)
    if (!validation.valid) {
      console.error('Validierungsfehler:', validation.errors)
      const filled = fillMissingDefaults(parsed)
      return NextResponse.json({
        ...filled,
        owner: session.user.name || 'Unbekannt',
        status: 'draft',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
    }

    const result = {
      ...(parsed as typeof parsed),
      owner: session.user.name || 'Unbekannt',
      status: 'draft' as const,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('AI Generation Error:', error)

    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Zu viele Anfragen. Versuche in 1 Minute erneut.' },
          { status: 429 }
        )
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API-Konfigurationsfehler. Kontaktiere einen Administrator.' },
          { status: 500 }
        )
      }
      if (error.status === 504) {
        return NextResponse.json(
          { error: 'Verarbeitung dauert zu lange. Versuche erneut mit weniger Text.' },
          { status: 504 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Fehler bei der Prozessgenerierung. Versuche erneut.' },
      { status: 500 }
    )
  }
}
