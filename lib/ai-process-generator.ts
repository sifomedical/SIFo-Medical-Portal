import { Process, CategoryId, ProcessStep, ProcessTool } from '@/types/process'

export interface AIGenerationResponse {
  title: string
  subtitle: string
  description: string
  purpose: string
  scope: string
  responsibilities: string[]
  definitions: Record<string, string>
  inputs: string[]
  steps: ProcessStep[]
  risksAndControls: Array<{ risk: string; control: string }>
  outputs: string[]
  records: string[]
  goals: string[]
  tools: ProcessTool[]
  tags: string[]
  mermaidDiagram: string
  frequency: string
  clarifying_questions?: string[]
}

export function buildGenerationPrompt(
  category: CategoryId,
  userInput: string,
  clarifications?: Record<string, string>
): string {
  const clarificationContext = clarifications
    ? `\n\nNutzer hat folgende Folgefragen beantwortet:\n${Object.entries(clarifications)
        .map(([q, a]) => `- ${q}: ${a}`)
        .join('\n')}`
    : ''

  return `Du bist ein Prozess-Dokumentationsexperte für ein Medizintechnik-Unternehmen (SIFo Medical).

Kategorie: ${category}

Extrahiere aus der Nutzerbeschreibung alle folgenden Felder für eine Prozessdokumentation und antworte mit gültigem JSON:

FELDER ZUM EXTRAHIEREN:
1. title (string, max 50 Zeichen): Kurzer Prozessname
2. subtitle (string): Ein Satz Beschreibung
3. description (string): Detaillierte Erklärung (2-3 Sätze)
4. purpose (string): Warum dieser Prozess existiert
5. scope (string): Wer/was/wann ist dieser Prozess relevant
6. responsibilities (string[]): Liste von Verantwortlichkeiten (mindestens 3)
7. definitions (object): Key-Value Paare für Fachbegriffe (mindestens 2)
8. inputs (string[]): Was ist notwendig um den Prozess zu starten (mindestens 2)
9. steps (ProcessStep[]): Nummerierte Schritte (mindestens 3, können Substeps haben)
   - Jeder Step muss haben: id (string), title (string), description (string)
10. risksAndControls (array): Risiken und wie sie kontrolliert werden (mindestens 2)
    - Format: {risk: string, control: string}
11. outputs (string[]): Was ist das Ergebnis (mindestens 1)
12. records (string[]): Welche Dokumentation wird erstellt (mindestens 1)
13. goals (string[]): Was sind die Ziele (mindestens 1)
14. tools (ProcessTool[]): Welche Tools/Software werden benötigt
    - Format: {name: string, url?: string, icon?: string}
15. tags (string[]): Relevante Tags (mindestens 2)
16. frequency (string): Wie oft findet dieser Prozess statt (z.B. "täglich", "wöchentlich")
17. mermaidDiagram (string): Flowchart in Mermaid-Syntax (einfach aber aussagekräftig)

WICHTIG:
- Alle Felder sind Pflichtfelder
- Antworte NUR mit JSON, kein zusätzlicher Text
- Nutze realistische, konkrete Werte basierend auf dem Input
- Falls kritische Informationen FEHLEN (z.B. keine Tools erwähnt, nicht klar wer verantwortlich ist),
  antworte mit maximal 3 "clarifying_questions" statt vollständigen Feldern
- Mermaid Diagram sollte einen einfachen Flowchart mit 5-10 Schritten zeigen

JSON SCHEMA BEISPIEL:
{
  "title": "...",
  "subtitle": "...",
  "description": "...",
  "purpose": "...",
  "scope": "...",
  "responsibilities": ["...", "..."],
  "definitions": {"Begriff1": "Definition1", "Begriff2": "Definition2"},
  "inputs": ["...", "..."],
  "steps": [
    {
      "id": "step1",
      "title": "...",
      "description": "...",
      "substeps": [
        {"id": "step1a", "title": "...", "description": "..."}
      ]
    }
  ],
  "risksAndControls": [
    {"risk": "...", "control": "..."}
  ],
  "outputs": ["..."],
  "records": ["..."],
  "goals": ["..."],
  "tools": [{"name": "...", "url": "..."}],
  "tags": ["tag1", "tag2"],
  "frequency": "...",
  "mermaidDiagram": "graph TD\\n A[Start] --> B[Schritt 2]\\n B --> C[End]"
}

NUTZERBESCHREIBUNG:
${userInput}${clarificationContext}

Antworte AUSSCHLIESSLICH mit JSON:`
}

export function parseAIResponse(
  responseText: string
): AIGenerationResponse | { clarifying_questions: string[] } {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Kein JSON in der Antwort gefunden')
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (parsed.clarifying_questions && parsed.clarifying_questions.length > 0) {
      return { clarifying_questions: parsed.clarifying_questions }
    }

    return parsed as AIGenerationResponse
  } catch (error) {
    console.error('Fehler beim Parsen der AI-Antwort:', error)
    throw new Error('KI-Antwort konnte nicht geparst werden')
  }
}

export function validateGeneratedProcess(
  process: Partial<AIGenerationResponse>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const requiredFields: (keyof AIGenerationResponse)[] = [
    'title',
    'subtitle',
    'description',
    'purpose',
    'scope',
    'responsibilities',
    'definitions',
    'inputs',
    'steps',
    'risksAndControls',
    'outputs',
    'records',
    'goals',
    'tools',
    'tags',
    'frequency',
    'mermaidDiagram',
  ]

  for (const field of requiredFields) {
    if (!(field in process) || process[field] === undefined) {
      errors.push(`Feld "${field}" fehlt`)
    }
  }

  if (process.title && process.title.length > 50) {
    errors.push('Title darf nicht länger als 50 Zeichen sein')
  }

  if (process.steps && (!Array.isArray(process.steps) || process.steps.length === 0)) {
    errors.push('Mindestens ein Prozessschritt ist erforderlich')
  }

  if (
    process.responsibilities &&
    (!Array.isArray(process.responsibilities) || process.responsibilities.length === 0)
  ) {
    errors.push('Mindestens eine Verantwortlichkeit ist erforderlich')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function fillMissingDefaults(process: Partial<AIGenerationResponse>): AIGenerationResponse {
  return {
    title: process.title || 'Neuer Prozess',
    subtitle: process.subtitle || 'Prozessbeschreibung',
    description: process.description || '',
    purpose: process.purpose || '',
    scope: process.scope || '',
    responsibilities: process.responsibilities || [],
    definitions: process.definitions || {},
    inputs: process.inputs || [],
    steps: process.steps || [],
    risksAndControls: process.risksAndControls || [],
    outputs: process.outputs || [],
    records: process.records || [],
    goals: process.goals || [],
    tools: process.tools || [],
    tags: process.tags || [],
    frequency: process.frequency || 'Nach Bedarf',
    mermaidDiagram: process.mermaidDiagram || 'graph TD\\n A[Start] --> B[Prozess]\\n B --> C[End]',
  }
}
