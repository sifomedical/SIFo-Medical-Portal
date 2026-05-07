# 🗄️ Supabase Datenbank-Einrichtung

## Übersicht

Die App ist konfiguriert, um Supabase als Datenbank zu verwenden. Diese Anleitung hilft dir, die Datenbank richtig einzurichten.

## Voraussetzungen

- ✅ Supabase Project bereits erstellt (URL + Keys in `.env.local`)
- ✅ Google OAuth konfiguriert in Supabase
- ✅ `.env.local` hat SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY

## Schritte

### Schritt 1: SQL-Migration in Supabase ausführen

1. Öffne das [Supabase Dashboard](https://supabase.com/dashboard)
2. Gehe zu deinem Project: `sifo-medical-process-portal`
3. Klicke auf **SQL Editor** (linke Seitenleiste)
4. Klicke auf **New Query**
5. Kopiere den gesamten Inhalt von `supabase/migrations/001_init_schema.sql` in den Editor
6. Klicke **Run** (oder Ctrl+Enter)

**Expected Output:**
```
Query executed successfully
```

### Schritt 2: Verifikation

Gehe zu **Table Editor** und bestätige, dass diese Tabellen existieren:
- ✅ `users`
- ✅ `processes`
- ✅ `attachments`
- ✅ `process_history`
- ✅ `audit_log`

### Schritt 3: Daten migrieren (optional)

Falls du bereits Prozesse in der alten Struktur (JSON-Dateien) hast:

```bash
npx ts-node scripts/migrate-to-supabase.ts
```

Dieses Skript:
- Erstellt einen "System User" (wird als `created_by` für existierende Prozesse verwendet)
- Migriert alle Prozesse von `/data/processes/*.json` nach Supabase
- Verrifiziert die Migration

## Testing

Nach der Einrichtung testen:

```bash
npm run dev
```

1. **Öffne** http://localhost:3000
2. **Klicke** "Mit Google anmelden"
3. **Mit Admin-Email anmelden**: `sifo.medical@gmail.com`
4. ✅ Du solltest direkt zum Dashboard weitergeleitet werden (kein Pending-Approval!)
5. ✅ Du kannst Prozesse sehen und archivieren

## Wenn es nicht funktioniert

### Fehler: "users table does not exist"
→ Du hast Schritt 1 (SQL-Migration) nicht ausgeführt. Bitte nachmachen!

### Fehler: "AccessDenied" beim Login
→ Der Admin wird nicht als "approved" erkannt. Das bedeutet:
- Der Database-Abfrage ist fehlgeschlagen (Netzwerk-Fehler?)
- Check: `.env.local` hat korrekte SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY

### Login funktioniert, aber andere Benutzer sehen "Pending Approval"
→ Das ist normal! Neue Benutzer müssen vom Admin genehmigt werden.
→ Gehe zum Admin-Panel (/admin) und genehmige sie.

## Troubleshooting

Wenn du Debug-Informationen brauchst, öffne die Browser Console (F12) und schau nach:
1. Network-Requests zu `/api/auth/callback` (Google OAuth)
2. Errors beim `getUserByEmail` oder `createUser` Aufruf

## Nächste Schritte

Nach erfolgreicher Einrichtung:
- [ ] Test: Admin kann sich einloggen
- [ ] Test: Neuer Benutzer kann sich anmelden (wird pending angezeigt)
- [ ] Test: Admin kann Benutzer genehmigen
- [ ] Test: Genehmigter Benutzer kann sich anmelden
- [ ] Test: Admin kann Prozesse archivieren/wiederherstellen

---

**Fragen?** Schau dir die Fehler im Supabase SQL Editor oder der Browser Console an.
