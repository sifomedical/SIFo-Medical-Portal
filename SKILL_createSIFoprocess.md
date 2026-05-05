# Create SIFo Process Skill

## Overview

This skill helps SIFo Medical employees create new business processes through natural language description. The skill:

1. **Gathers process details** through interactive multi-turn conversation
2. **Auto-generates Mermaid diagrams** showing the process flow
3. **Validates all required information** before saving
4. **Asks clarifying questions** when details are unclear
5. **Saves as Draft** in Vercel KV for admin approval
6. **Notifies admin** to review and approve

After approval by the admin, the process:
- 🚀 Automatically deploys to production
- 📍 Appears in the portal dashboard
- 🔍 Becomes searchable across all categories
- 📄 Shows up in detail pages with full documentation

---

## Skill Workflow

### Phase 1: Gather Process Information

Ask the user to describe their process. Then systematically collect:

**1. Basic Info** (title, subtitle, owner)
- "Was ist der genaue Titel des Prozesses?" 
- "Kurze Untertitel (1-2 Wörter)?"
- "Wer ist der Owner dieses Prozesses?"

**2. Category & Purpose** (category, description)
- "In welche Kategorie gehört der Prozess?" 
  - Options: marketing, sales, operations, hr, quality, finance
- "Ausführliche Beschreibung des Prozesses" (2-3 Sätze)

**3. Goals & Frequency** (goals, frequency)
- "Was sind die 2-3 Ziele dieses Prozesses?"
- "Wie oft wird dieser Prozess durchgeführt?"
  - Examples: "täglich", "wöchentlich", "bei Bedarf (durchschnittlich 2-3x pro Monat)"

**4. Steps & Substeps** (steps)
- "Welche Schritte hat dieser Prozess?"
- For each step:
  - Title: "Was ist der Titel dieses Schritts?"
  - Description: "Kurze Beschreibung"
  - Substeps: "Gibt es Substeps?" (if yes, list them)

**5. Tools** (tools)
- "Welche Tools/Systeme werden in diesem Prozess verwendet?"
- For each tool:
  - Name: "Name des Tools"
  - URL: "Link zum Tool (optional)"

**6. Tags & Video** (tags, processVideoUrl)
- "Welche Tags beschreiben den Prozess?" (comma-separated)
- "Gibt es ein Erklärvideo?" (optional, link or "nein")

### Phase 2: Clarify & Validate

**If details are unclear**, ask follow-up questions:
- "Das ist noch nicht ganz klar... Kannst du das präzisieren?"
- "Meinst du damit, dass...?"
- "Braucht dieser Schritt noch Substeps?"

**Check for completeness:**
- All required fields filled
- At least 2-3 steps
- At least 2-3 goals
- At least 1 tool
- Owner is realistic (not "Admin" or "TBD")

### Phase 3: Generate & Preview

1. **Auto-generate**:
   - Generate slug from title
   - Generate Mermaid diagram from steps
   - Set default values for missing optional fields

2. **Show preview** to user:
   ```
   ✅ PROZESS VORLAGE GENERIERT
   
   📋 TITEL: [title]
   📝 UNTERTITEL: [subtitle]
   🏷️ KATEGORIE: [category]
   👤 OWNER: [owner]
   ⏱️ FREQUENZ: [frequency]
   
   📌 BESCHREIBUNG:
   [description]
   
   🎯 ZIELE:
   • [goal 1]
   • [goal 2]
   • [goal 3]
   
   📍 SCHRITTE:
   • [step 1] (x Substeps)
   • [step 2]
   ...
   
   🛠️ TOOLS:
   [tool 1], [tool 2], ...
   
   🏷️ TAGS:
   [tags]
   ```

### Phase 4: Confirm & Save

**Ask for confirmation:**
```
✅ Alle Infos vorhanden? Speichern?
Ja / Nein (falls Änderungen nötig)
```

**If "Ja"**:
1. Call `/api/processes/draft` to save
2. Save to Vercel KV with `createdBy: user.email`
3. Show confirmation:
   ```
   ✅ Prozess erfolgreich als Entwurf gespeichert!
   📧 Admin wird benachrichtigt: sifo.medical@gmail.com
   ⏳ Genehmigung erwartet: 1-2 Tage
   🔗 Admin Dashboard: https://[portal]/admin/processes
   ```

**If "Nein"**:
- Ask: "Was möchtest du ändern?"
- Update the relevant fields
- Go back to Phase 3 (show preview again)

---

## Implementation in Claude Code

You can use this skill directly in conversations:

### Example 1: Create New Process
```
/createSIFoprocess
"Ich möchte einen neuen Prozess für Kundendaten-Verwaltung erstellen..."
```

The skill will:
1. Ask clarifying questions
2. Gather all details
3. Generate JSON
4. Show preview
5. Ask for confirmation
6. Save to system

### Example 2: Follow Natural Conversation
```
/createSIFoprocess
"Es wäre cool, wenn wir einen Prozess für die Onboarding-Dokumentation hätten..."
```

The skill adapts to the conversational style and gently guides to structured data.

---

## Skill Behavior Rules

### DO:
- ✅ Ask clarifying questions when something is unclear
- ✅ Be conversational and friendly
- ✅ Suggest examples if the user seems stuck
- ✅ Validate email format for Owner
- ✅ Suggest realistic categories based on description
- ✅ Ask about substeps if a step seems complex
- ✅ Confirm ALL details before saving
- ✅ Use German for all user-facing text (company language)

### DON'T:
- ❌ Don't save without explicit confirmation ("Speichern?")
- ❌ Don't ask for fields not marked as required
- ❌ Don't change the portal code or routes
- ❌ Don't skip validation (check all required fields)
- ❌ Don't save incomplete processes
- ❌ Don't make up data or assumptions

---

## Required Fields Checklist

Before asking "Alle Infos vorhanden?", verify:

- [ ] `title` - Process name (not empty, not "Prozess")
- [ ] `subtitle` - 1-3 word description
- [ ] `category` - One of: marketing, sales, operations, hr, quality, finance
- [ ] `description` - 2-3 sentences explaining the process
- [ ] `goals` - At least 2-3 specific goals
- [ ] `owner` - Real person's name/email (not "Admin" or "TBD")
- [ ] `frequency` - When the process runs (daily, weekly, on-demand, etc.)
- [ ] `steps` - At least 2-3 steps with titles + descriptions
- [ ] `tools` - At least 1 tool/system used
- [ ] `tags` - At least 2-3 tags (comma-separated)
- [ ] `status` - "draft" (set automatically)
- [ ] `mermaidDiagram` - Auto-generated from steps

---

## Example: Full Workflow Transcript

**User:**
```
/createSIFoprocess
Ich will einen Prozess für Lieferanten-Bewertung dokumentieren
```

**Skill:**
```
Großartig! Lass mich dir dabei helfen, diesen Prozess zu dokumentieren.

📋 Zuerst die Basics:

1️⃣ Was ist der genaue Titel des Prozesses?
(z.B. "Lieferanten-Bewertung und Auditierung")
```

**User:**
```
Lieferanten-Bewertung und Freigabe
```

**Skill:**
```
Perfect! 

2️⃣ Kurzer Untertitel (1-3 Worte)?
(z.B. "Überprüfung neuer Partner")
```

**User:**
```
Überprüfung und Genehmigung
```

...

[After gathering all details]

**Skill:**
```
✅ PROZESS VORLAGE GENERIERT

📋 TITEL: Lieferanten-Bewertung und Freigabe
📝 UNTERTITEL: Überprüfung und Genehmigung
🏷️ KATEGORIE: operations
👤 OWNER: Anna Schmidt
⏱️ FREQUENZ: bei Bedarf (durchschnittlich 3x pro Monat)

📌 BESCHREIBUNG:
Strukturierter Prozess zur Überprüfung neuer Lieferanten...

[preview continues...]

✅ Alle Infos vorhanden? Speichern?
Schreib "ja" zum Speichern oder "nein" um noch etwas zu ändern.
```

**User:**
```
ja
```

**Skill:**
```
✅ Prozess erfolgreich als Entwurf gespeichert!

📊 Prozessdetails:
- ID: process-lieferanten-bewertung
- Slug: lieferanten-bewertung-und-freigabe
- Status: Entwurf (wartet auf Genehmigung)

📧 Admin wird benachrichtigt: sifo.medical@gmail.com
⏳ Genehmigung erwartet: 1-2 Tage

🔗 Admin kann den Prozess hier genehmigen:
   https://sifo-process-portal.vercel.app/admin/processes

🚀 Nach Genehmigung:
   - Automatische Produktion-Deployment
   - Prozess erscheint im Portal
   - Sofort durchsuchbar
   - Alle Mitarbeiter können ihn nutzen

Vielen Dank für die Dokumentation!
```

---

## API Integration

The skill uses these endpoints:

### POST `/api/processes/draft`
Save a new draft process.

**Request:**
```json
{
  "id": "unique-id",
  "slug": "process-slug",
  "title": "Process Title",
  "subtitle": "Short subtitle",
  "category": "operations",
  "description": "Detailed description...",
  "goals": ["Goal 1", "Goal 2"],
  "steps": [
    {
      "id": "step-1",
      "title": "Step Title",
      "description": "Step description",
      "tools": [],
      "substeps": []
    }
  ],
  "tools": [
    {
      "name": "Tool Name",
      "url": "https://...",
      "icon": "🛠️"
    }
  ],
  "owner": "Owner Name",
  "frequency": "daily",
  "tags": ["tag1", "tag2"],
  "mermaidDiagram": "graph TD...",
  "processVideoUrl": null,
  "lastUpdated": "2026-05-05T10:00:00Z",
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "slug": "process-slug",
  "message": "Draft process saved successfully",
  "status": "pending_approval"
}
```

### GET `/admin/processes`
Admin reviews all pending drafts.

---

## Data Flow After Save

```
1. Skill saves Draft to Vercel KV
   └─ Key: "process:draft:{slug}"
   └─ Also added to "processes:drafts" set

2. Admin sees in /admin/processes dashboard
   └─ Shows all pending drafts
   └─ Can Approve or Reject

3. When Admin clicks "Approve":
   ✅ JSON written to /data/processes/{slug}.json
   ✅ Vercel API triggered for auto-deploy
   ✅ ~30-60 seconds: Build starts
   ✅ Loader picks up new JSON file
   ✅ New process in ALL_PROCESSES
   ✅ Available everywhere (Dashboard, Categories, Search, Details)

4. User sees process live
   ✅ In portal immediately after deploy
   ✅ Searchable
   ✅ In category listing
   ✅ Full detail page
```

---

## Tips for Best Results

1. **Be Specific**: Help user think through the process step-by-step
2. **Ask Why**: "Warum ist dieser Schritt wichtig?" helps clarify substeps
3. **Realistic Owners**: Suggest actual team members, not generic titles
4. **Simple Titles**: Step titles should be action-oriented ("Anfrage erhalten" not "Empfangen von Anfragen")
5. **Tool Links**: Try to get actual Odoo/system URLs when possible
6. **Categories**: Use existing processes in that category as reference
7. **Tags**: Suggest tags based on process content (not random)

---

## Troubleshooting

**Problem**: "Unbekannter Fehler beim Speichern"
- Check: User is logged in
- Check: All required fields filled
- Check: No special characters in slug

**Problem**: "Process wird nicht genehmigt"
- Admin Dashboard: https://sifo-process-portal.vercel.app/admin/processes
- Check: Process is visible in "Pending Processes" tab
- Admin email: sifo.medical@gmail.com

**Problem**: "Process sichtbar nach Genehmigung"
- Wait 60 seconds (deployment takes 30-60s)
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check: Status is "active", not "draft"

---

## Notes

- This skill works in Claude Code / Claude.ai
- All processes are automatically backed up in Vercel KV
- Processes can be edited by creator or admin before approval
- Once approved, processes are immutable (create new version instead)
- Video URLs are optional - skip if user says "nein"
- The mermaid diagram is auto-generated, no manual input needed
