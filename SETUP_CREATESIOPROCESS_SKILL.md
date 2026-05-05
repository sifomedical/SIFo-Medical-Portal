# Setup: /createSIFoprocess Skill

## Status: ✅ Backend COMPLETE & READY

All backend infrastructure is built and tested:
- ✅ 4 new API endpoints created and working
- ✅ KV database functions ready
- ✅ Admin dashboard page operational
- ✅ Helper library with utilities
- ✅ Project builds successfully with no errors

## What You Need to Do: Create the Skill in Claude Code

### Quick Setup (2 minutes)

#### Step 1: Open Skill Creator
In Claude Code, click the **+ icon** (top menu) or go to **Settings → Skills → New Skill**

#### Step 2: Skill Details
Fill in these fields:
- **Name**: `createSIFoprocess`
- **Display Name**: Create SIFo Process
- **Description**: Erstelle einen neuen Prozess durch Beschreibung – automatisch strukturiert und genehmigungspflichtig
- **Command**: `/createSIFoprocess`
- **Enabled**: Toggle ON

#### Step 3: Copy the Prompt
Open file: `SKILL_DEFINITION.md`
Copy the entire "Skill Prompt Template" section (the large prompt block starting with "Du bist ein Prozess-Generierungs-Assistent...")

Paste it into the Claude Code skill prompt field.

#### Step 4: Save & Test
Click "Save" or "Create Skill"

The skill should now appear in your `/` command menu!

---

## Testing the Skill (3 minutes)

### Test 1: Basic Invocation
Type in Claude Code:
```
/createSIFoprocess
```

You should see a friendly greeting and a question asking you to describe a process.

### Test 2: Create a Sample Process
Describe a simple process:
```
Ich möchte einen Prozess für die tägliche Team-Standup erstellen. 
Jeden Morgen um 9 Uhr treffen sich alle Mitarbeiter für 15 Minuten 
um die Aufgaben des Tages zu besprechen.
```

The skill should:
1. Ask clarifying questions
2. Collect details (category, owner, tools, etc.)
3. Generate the complete JSON
4. Show a preview
5. Save to the database
6. Confirm: "✨ Der Prozess wurde als Entwurf gespeichert..."

### Test 3: Admin Approval
1. Log in with `sifo.medical@gmail.com`
2. Go to `/admin/processes`
3. You should see the process from Test 2 in "Pending Processes"
4. Click "Approve" button
5. Confirmation: "✅ Process approved!"

### Test 4: Search Visibility
If Search is updated with draft support:
1. Go to `/dashboard` or `/` (home)
2. Open the search bar
3. Search for the process name
4. Should show with [ENTWURF] badge

---

## File Reference Guide

### For the Skill Developer
- **`SKILL_DEFINITION.md`** - Complete skill definition & prompt template
- **`lib/skill-createProcess.ts`** - Helper functions available to the skill
- **`TEST_CREATE_PROCESS_SKILL.md`** - Testing guide & troubleshooting

### For Backend Implementation
- **`lib/db-processes.ts`** - KV database operations
- **`app/api/processes/draft/route.ts`** - Save draft process API
- **`app/api/admin/processes/route.ts`** - List all drafts (admin only)
- **`app/api/admin/processes/approve/route.ts`** - Approve draft process
- **`app/api/admin/processes/reject/route.ts`** - Reject draft process

### For Admin Interface
- **`app/admin/processes/page.tsx`** - Admin dashboard for approving/rejecting drafts

### Supporting Types & Utilities
- **`types/process.ts`** - Process & DraftProcess interfaces
- **`lib/skill-createProcess.ts`** - Validation, formatting, slug generation

---

## Architecture Overview

```
EMPLOYEE
    ↓
/createSIFoprocess Skill
    ↓
Multi-turn Conversation
(Questions & clarifications)
    ↓
Generate Complete JSON
+ Auto-generate Mermaid diagram
    ↓
POST /api/processes/draft
    ↓
Vercel KV Database
(Stored as "process:draft:{slug}")
    ↓
ADMIN DASHBOARD (/admin/processes)
    ↓
Approve or Reject
    ↓
(Approved) → Active Portal
(Rejected) → Deleted
```

---

## Feature Checklist

After creating and testing the skill, these features are available:

| Feature | Status |
|---------|--------|
| Voice/Text process creation | ✅ Ready |
| Multi-turn conversation | ✅ Ready |
| Auto-generated Mermaid diagrams | ✅ Ready |
| Save as draft | ✅ Ready |
| Admin approval workflow | ✅ Ready |
| Process validation | ✅ Ready |
| Error handling | ✅ Ready |
| Draft preview formatting | ✅ Ready |

### Coming Soon (Next Phases)
- [ ] Update SearchDropdown to show drafts with [ENTWURF] badge
- [ ] Auto-write to `/data/processes/{slug}.json` on approval
- [ ] Auto-trigger CI/CD build & deploy

---

## Troubleshooting

### "I don't see the skill in my command menu"

**Solution**: 
1. Make sure you saved the skill (check Settings → Skills)
2. Refresh Claude Code (Ctrl+R or Cmd+R)
3. Try typing `/` and looking for `createSIFoprocess`
4. If still not visible, try creating the skill again with the exact steps above

### "API returns 401 Unauthorized"

**Cause**: Not authenticated or session expired

**Solution**:
1. Log in with your Google account
2. Make sure you have permission to create processes
3. Check that your email is in `ALLOWED_EMAILS` in `.env.local`

### "Process not appearing in admin dashboard"

**Cause**: Draft process wasn't saved to Vercel KV

**Solutions**:
1. Check browser console (F12) for JavaScript errors
2. Check server logs in terminal (npm run dev output)
3. Verify KV connection: `redis-cli ping` (if local Redis)
4. Check `.env.local` has `KV_REST_API_URL` and `KV_REST_API_TOKEN`

### "Mermaid diagram looks broken"

**Cause**: Complex steps structure isn't rendering well

**Solution**:
1. Review the generated diagram in the process preview
2. For now, you can manually edit it after approval
3. Open `/admin/processes` and edit the approved process

---

## Next Steps After Skill is Working

1. **Deploy to production**: `npm run deploy`
2. **Update SearchDropdown**: Add draft process visualization
3. **Setup auto-deployment**: Implement CI/CD trigger on approval
4. **Train team**: Show employees how to use `/createSIFoprocess`
5. **Monitor**: Track created processes in admin dashboard

---

## Quick Reference: Skill Commands

Once created, these work immediately:

| Command | Action |
|---------|--------|
| `/createSIFoprocess` | Start process creation workflow |
| `/admin/processes` (navigate URL) | Admin approval dashboard |
| Any process description | Skill auto-triggers with questions |

---

## Support

For issues or questions:
1. Check `SKILL_DEFINITION.md` for detailed prompt
2. Check `TEST_CREATE_PROCESS_SKILL.md` for testing guide
3. Review API documentation in individual route files
4. Check browser console (F12) for client-side errors
5. Check terminal logs (npm run dev) for server-side errors

---

## Summary

✅ **Backend**: Fully implemented and built successfully
📝 **Skill**: Ready to create in Claude Code (use SKILL_DEFINITION.md)
🚀 **Next**: Create the skill using the setup steps above

**Time to complete setup**: ~5 minutes
**Time to first test**: ~10 minutes total

Let's go! 🎉
