# /createSIFoprocess Skill Definition

## Overview
The `/createSIFoprocess` skill allows SIFo Medical employees to create new processes by describing them in natural language (voice or text). The skill orchestrates a multi-turn conversation to gather all required process details, auto-generates a Mermaid flowchart diagram, and saves the process as a draft pending admin approval.

## Skill Registration

**Skill Name**: `createSIFoprocess`
**Description**: Erstelle einen neuen Prozess durch verbale Beschreibung – der Prozess wird automatisch strukturiert und zur Genehmigung eingereicht
**Command**: `/createSIFoprocess`

## User Flow

1. **User invokes skill**: `/createSIFoprocess` or describes a process
2. **Skill asks clarifying questions** in a natural, conversational way:
   - What is the exact title of this process?
   - Which category does it belong to? (marketing, sales, operations, hr, quality, finance)
   - What's a brief subtitle or tagline?
   - What's the main description?
   - What are the goals of this process? (list 2-3)
   - What are the main steps? (with potential substeps)
   - What tools are used?
   - Who is the owner/responsible person?
   - How often is this process executed? (daily, weekly, monthly, etc.)
   - Any additional tags?

3. **Skill generates**:
   - Complete JSON process structure
   - Mermaid flowchart from steps
   - Validation checks

4. **Skill saves** draft to database via `/api/processes/draft`

5. **User sees**:
   - Process preview (formatted display)
   - Confirmation that process is pending admin approval
   - Link to admin approval dashboard

6. **Admin workflow** (separate - not part of skill):
   - Admin visits `/admin/processes`
   - Reviews pending process
   - Clicks Approve or Reject
   - Approved processes are built and deployed

## Skill Prompt Template

```
Du bist ein Prozess-Generierungs-Assistent für das SIFo Medical Process Portal.

Deine Aufgabe: Mitarbeiter bei der Erstellung neuer Geschäftsprozesse unterstützen.

WICHTIG:
1. Stelle Fragen in natürlicher, freundlicher Weise
2. Akzeptiere sowohl detaillierte als auch kurze Eingaben
3. Generiere automatisch eine vollständige JSON-Struktur
4. Erstelle ein Mermaid-Flowchart aus den Schritten
5. Speichere den Prozess als "Draft" (Entwurf)
6. Ein Admin muss den Prozess genehmigen bevor er live geht

KATEGORIEN (wähle eine):
- marketing: Marketing-bezogene Prozesse (Webinare, Google Ads, LinkedIn, YouTube, Content, Kampagnen)
- sales: Sales-Prozesse (Angebote, Kundenakquisition, Verträge)
- operations: Betriebsprozesse (Abläufe, Logistik, Lieferungen)
- hr: Human Resources (Einstellung, Schulung, Verwaltung)
- quality: Qualitätssicherung (Tests, Reviews, Standards)
- finance: Finanzen (Zahlungen, Budgets, Rechnungen)

ABLAUF:
1. Begrüße den Nutzer freundlich
2. Frage nach Prozessname und Beschreibung
3. Frage nach Kategorie und Owner
4. Frage nach Zielen (2-3 Ziele)
5. Frage nach Schritten (Hauptschritte + Substeps)
6. Frage nach Tools/Software
7. Frage nach Frequenz und Tags
8. Generiere das finale JSON
9. Zeige Preview
10. Speichere via API
11. Bestätige Speicherung und informiere über Admin-Genehmigung

ERFORDERLICHE FELDER:
- id: Eindeutige ID (z.B. 'process-001')
- slug: URL-freundlicher Name (z.B. 'lieferantenbezahlung')
- title: Prozessname
- subtitle: Kurztitel
- category: Eine der 6 Kategorien
- description: Detaillierte Beschreibung
- goals: Array von Zielen
- steps: Array von Schritten mit Substeps
- tools: Array von verwendeten Tools
- owner: Verantwortliche Person/Email
- frequency: Wie oft wird der Prozess ausgeführt
- tags: Tags für Kategorisierung
- lastUpdated: ISO-Timestamp
- status: 'draft'
- mermaidDiagram: Auto-generiert aus steps

HELPER-FUNKTIONEN zu verwenden:
- generateSlug(title) → generiert URL-Slug
- generateMermaidDiagram(steps) → generiert Flowchart
- validateProcess(process) → validiert Struktur
- saveDraftProcessViaAPI(process, userEmail) → speichert Draft
- formatProcessPreview(process) → formatiert zur Anzeige

ANTWORTEN FORMAT:
Antworte in Markdown mit:
- Klaren Fragen
- Bestätigungen der Eingaben
- Am Ende: Fertig-Button mit Zusammenfassung
- Nach Speicherung: Erfolgsbestätigung

Sei hilfreich, geduldig und ermutigend! Mitarbeiter sollen sich trauen, neue Prozesse zu erstellen.
```

## Implementation Details

### Step 1: Install Skill in Claude Code

In Claude Code (web interface):
1. Open the Skill menu (+ icon or hamburger)
2. Create new Skill
3. Name: `createSIFoprocess`
4. Type: `instruction`
5. Paste the prompt template above
6. Enable: Access to conversation
7. Set as available globally

### Step 2: Enable API Access

The skill calls POST `/api/processes/draft`. Ensure:
- API route exists at `/app/api/processes/draft/route.ts` ✓
- Endpoint accepts authenticated users ✓
- Saves to Vercel KV database ✓

### Step 3: Testing

Test the skill locally:
```bash
# In Claude Code, invoke the skill
/createSIFoprocess

# Follow the prompts:
# 1. Describe a process (e.g., "Ich möchte einen Prozess für die Lieferantenverwaltung erstellen")
# 2. Answer clarifying questions
# 3. Review the generated JSON
# 4. Confirm to save

# Expected output:
# ✅ PROZESS VORLAGE GENERIERT
# [Process preview with all details]
# ✨ Der Prozess wurde als Entwurf gespeichert...
```

## Backend Infrastructure Ready ✓

All required backend is implemented:

| Component | File | Status |
|-----------|------|--------|
| API Route: Save Draft | `/app/api/processes/draft/route.ts` | ✓ Done |
| API Route: Approve Draft | `/app/api/admin/processes/approve/route.ts` | ✓ Done |
| API Route: Reject Draft | `/app/api/admin/processes/reject/route.ts` | ✓ Done |
| API Route: List Drafts | `/app/api/admin/processes/route.ts` | ✓ Done |
| KV Functions | `/lib/db-processes.ts` | ✓ Done |
| Admin Dashboard | `/app/admin/processes/page.tsx` | ✓ Done |
| Helper Functions | `/lib/skill-createProcess.ts` | ✓ Done |
| Types | `/types/process.ts` | ✓ Done |

## Admin Workflow (After Skill Creates Draft)

1. Admin logs in with `sifo.medical@gmail.com`
2. Navigates to `/admin/processes`
3. Sees "Pending Processes" tab
4. Reviews draft process:
   - Title, Category, Description
   - Created by (employee email)
   - Created date
5. Clicks "Approve" button:
   - Draft is validated
   - Marked as active in KV
   - Process data becomes available in live portal
   - (TODO: Auto-write to `/data/processes/{slug}.json`)
   - (TODO: Trigger build/deploy)
6. Or clicks "Reject" button:
   - Draft is deleted
   - Creator is notified

## Example: Creating a "Lieferantenzahlung" Process

**User input**:
> Ich möchte einen Prozess für die Zahlung an Lieferanten erstellen. Das passiert regelmäßig und ist wichtig für unsere Buchhaltung.

**Skill response**:
1. Fragt nach Details (Title, Kategorie, etc.)
2. Akzeptiert Eingaben
3. Generiert:
   ```json
   {
     "id": "process-002",
     "slug": "lieferantenzahlung",
     "title": "Lieferantenzahlung",
     "subtitle": "Prozess für regelmäßige Zahlungen an Lieferanten",
     "category": "finance",
     "description": "Strukturierter Prozess zur Verwaltung und Abwicklung von Zahlungen an externe Lieferanten",
     "goals": [
       "Pünktliche Zahlungen an Lieferanten",
       "Genaue Finanzaufzeichnungen",
       "Positive Geschäftsbeziehungen"
     ],
     "steps": [...],
     "tools": [...],
     "owner": "Finanzabteilung",
     "frequency": "Wöchentlich",
     "tags": ["finance", "lieferanten", "zahlung"],
     "status": "draft",
     "mermaidDiagram": "graph TD\n  A[Rechnung erhalten]...",
     "lastUpdated": "2026-04-30T..."
   }
   ```
4. Speichert als Draft
5. Zeigt Bestätigung und Admin-Link

## Support & Documentation

- **Helper Library**: `/lib/skill-createProcess.ts`
- **Type Definitions**: `/types/process.ts`
- **API Documentation**: See individual route files
- **Admin Guide**: See `/app/admin/processes/page.tsx`

## Next Steps

1. ✅ Create skill in Claude Code (using this definition)
2. Test skill with sample process
3. Admin approves test process
4. Implement auto-write to `/data/processes/{slug}.json` on approval
5. Implement CI/CD trigger for automatic build/deploy
6. Update SearchDropdown to show drafts with [ENTWURF] badge
