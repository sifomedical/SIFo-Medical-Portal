# Testing the /createSIFoprocess Skill

## Quick Start

The `/createSIFoprocess` skill is ready to use! Here's how to access it:

### Option 1: Use the Skill (Recommended)
In Claude Code, simply type:
```
/createSIFoprocess
```

Then describe a process you want to create, e.g.:
```
Ich möchte einen Prozess für die tägliche Mitarbeiterkommunikation erstellen. 
Jeden Morgen müssen wir eine kurze Besprechung halten, bei der alle ihre Aufgaben 
für den Tag berichten.
```

### Option 2: Manual Process (for testing)

If the skill isn't visible yet in Claude Code, you can manually test the workflow:

1. **Gather Process Details** (simulate what the skill would ask)
   - Title: "Tägliche Mitarbeiterkommunikation"
   - Subtitle: "Morgenbesprechung für Tagesplanung"
   - Category: "operations"
   - Description: Details about the process
   - Goals: [list of goals]
   - Steps: [structured steps]
   - Tools: [tools used]
   - Owner: Name of responsible person
   - Frequency: "Täglich"
   - Tags: ["communication", "daily", "planning"]

2. **Call the API Directly** (simulate what the skill would do):
   ```bash
   curl -X POST http://localhost:3000/api/processes/draft \
     -H "Content-Type: application/json" \
     -d '{
       "id": "process-003",
       "slug": "daily-communication",
       "title": "Tägliche Mitarbeiterkommunikation",
       "subtitle": "Morgenbesprechung für Tagesplanung",
       "category": "operations",
       "description": "Tägliche Besprechung zur Koordination",
       "goals": ["Abstimmung des Teams", "Transparenz"],
       "steps": [
         {
           "id": "step-1",
           "title": "Versammlung",
           "description": "Team versammelt sich",
           "tools": []
         }
       ],
       "tools": [{"name": "Slack", "url": "https://slack.com"}],
       "owner": "Teamleiter",
       "frequency": "Täglich",
       "lastUpdated": "2026-04-30T10:00:00Z",
       "mermaidDiagram": "graph TD\n  A[Versammlung]",
       "tags": ["communication", "daily"],
       "status": "draft"
     }'
   ```

3. **Verify in Admin Dashboard**:
   - Log in with `sifo.medical@gmail.com`
   - Go to `/admin/processes`
   - Should see the new draft process listed
   - Click "Approve" or "Reject"

## Expected Workflow

```
┌─────────────────┐
│ Employee        │
│ /createSIFoprocess    │
└────────┬────────┘
         │
         │ Describes process
         ▼
┌─────────────────────────────┐
│ Skill Multi-Turn Conversation
│ - Asks clarifying questions
│ - Validates inputs
│ - Generates JSON
│ - Creates Mermaid diagram
└────────┬────────────────────┘
         │
         │ POST /api/processes/draft
         ▼
┌──────────────────────────────┐
│ Vercel KV Database           │
│ Stores as: process:draft:{slug}
└────────┬─────────────────────┘
         │
         │ Employee sees confirmation
         │ Process is "Pending Approval"
         ▼
┌──────────────────────────────┐
│ Admin Dashboard (/admin/processes)
│ Admin reviews & approves
└────────┬─────────────────────┘
         │
         │ Approve/Reject
         ▼
┌──────────────────────────────┐
│ Active Process Portal         │
│ Process is now live
│ Searchable, visible to all
└──────────────────────────────┘
```

## Troubleshooting

### Skill Not Visible in Claude Code

**Possible reasons & solutions:**

1. **Skill not yet registered**
   - Solution: Create the skill manually in Claude Code using the prompt template in `SKILL_DEFINITION.md`
   
2. **Cache issue**
   - Solution: Refresh the page (Ctrl+R / Cmd+R)
   
3. **Skill disabled in settings**
   - Solution: Check Claude Code settings → Skills → enable `/createSIFoprocess`

### API Returns 401 Unauthorized

**Cause**: Not authenticated or invalid session

**Solution**:
1. Make sure you're logged in
2. Check that your email is in ALLOWED_EMAILS
3. Verify NextAuth.js session is active

### Process Not Appearing in Admin Dashboard

**Cause**: Draft not saved to Vercel KV

**Solution**:
1. Check browser console for errors
2. Verify Vercel KV credentials in `.env.local`
3. Check server logs: `npm run dev` output
4. Manually query KV: Check if `processes:drafts` set exists

### Mermaid Diagram Not Rendering

**Cause**: Invalid Mermaid syntax generated

**Solution**:
1. Review the generated diagram in the process preview
2. Manually correct if needed before saving
3. Check `/lib/skill-createProcess.ts` → `generateMermaidDiagram()` function

## Files Ready for the Skill

All backend infrastructure is prepared:

| File | Purpose |
|------|---------|
| `/lib/skill-createProcess.ts` | Helper functions for the skill |
| `/lib/db-processes.ts` | KV database operations |
| `/app/api/processes/draft/route.ts` | Save draft API |
| `/app/api/admin/processes/route.ts` | List drafts API |
| `/app/api/admin/processes/approve/route.ts` | Approve draft API |
| `/app/api/admin/processes/reject/route.ts` | Reject draft API |
| `/app/admin/processes/page.tsx` | Admin dashboard UI |
| `/SKILL_DEFINITION.md` | Complete skill definition & prompt |

## Creating the Skill in Claude Code

### Step 1: Access Skill Creation
In Claude Code (top menu):
```
+ New Skill
  OR
Settings → Skills → + Add Skill
```

### Step 2: Fill in Details
- **Skill Name**: `createSIFoprocess`
- **Display Name**: Create Process
- **Command**: `/createSIFoprocess`
- **Type**: Conversation Helper / Instruction

### Step 3: Paste the Prompt
Copy the entire prompt from `SKILL_DEFINITION.md` and paste it into the skill prompt field.

### Step 4: Enable & Save
- Toggle ON to enable
- Save the skill
- The skill should now appear in the / command menu

### Step 5: Test
Type `/createSIFoprocess` and follow the prompts!

## Next Steps After Creating the Skill

1. ✅ **Create the skill** (you are here)
2. **Test it locally**:
   - Create a test process via skill
   - Review in admin dashboard
   - Approve to make it live
3. **Update SearchDropdown** to show drafts with [ENTWURF] badge
4. **Deploy** to production

## Example Process for Testing

### Description
"Wir brauchen einen standardisierten Prozess für die Bearbeitung von Kundenbeschwerden. 
Die Kundenbeschwerden kommen per Email an, müssen dokumentiert werden, analysiert werden 
und dann muss ein Lösungsvorschlag gemacht werden. Am Ende muss der Kunde informiert werden."

### Expected JSON Output
```json
{
  "id": "process-complaints",
  "slug": "customer-complaint-handling",
  "title": "Bearbeitung von Kundenbeschwerden",
  "subtitle": "Strukturierter Prozess zur Verwaltung und Lösung von Kundenbeschwerden",
  "category": "operations",
  "description": "Standardisierter Prozess für die Entgegennahme, Dokumentation, Analyse und Beantwortung von Kundenbeschwerden",
  "goals": [
    "Schnelle und zufriedenstellende Lösung von Kundenproblemen",
    "Dokumentation aller Beschwerden für Qualitätsmanagement",
    "Verbesserung der Kundenbeziehungen"
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Beschwerde erhalten",
      "description": "Email mit Kundenbeschwerde wird empfangen",
      "tools": ["Email", "Ticketing-System"]
    },
    {
      "id": "step-2",
      "title": "Dokumentation",
      "description": "Beschwerde wird im System dokumentiert",
      "tools": ["Ticketing-System", "Odoo"]
    },
    // ... more steps
  ],
  "tools": [
    {"name": "Email", "url": "mailto:support@sifo.de"},
    {"name": "Ticketing-System", "url": "https://tickets.sifo.de"},
    {"name": "Odoo", "url": "https://sifo-gmbh.odoo.com/web"}
  ],
  "owner": "Customer Success Manager",
  "frequency": "Bei Bedarf (durchschnittlich 5x pro Woche)",
  "tags": ["customer-service", "complaints", "quality"],
  "status": "draft",
  "mermaidDiagram": "graph TD\n  A[Email erhalten] --> B[Dokumentieren] --> ...",
  "lastUpdated": "2026-04-30T10:30:00Z"
}
```

---

**Ready to create a process? Type `/createSIFoprocess` and describe your process!**

For help with the backend or API details, see:
- `SKILL_DEFINITION.md` - Complete skill documentation
- `/lib/skill-createProcess.ts` - Helper functions
- `SKILL_DEFINITION.md` - How to register the skill
