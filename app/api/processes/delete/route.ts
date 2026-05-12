import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { slug, action } = await request.json()

    if (!slug || !action) {
      return NextResponse.json({ error: 'slug and action are required' }, { status: 400 })
    }

    // Check authorization: only admin or creator
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL

    if (action !== 'archive' && action !== 'restore') {
      return NextResponse.json({ error: 'Invalid action. Use "archive" or "restore"' }, { status: 400 })
    }

    const newStatus = action === 'archive' ? 'archived' : 'active'

    // Try UPDATE in Supabase first
    const { data: updated, error: updateError } = await supabase
      .from('processes')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('slug', slug)
      .select()

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
    }

    // If process wasn't in Supabase (JSON-only), check authorization via JSON
    if (!updated || updated.length === 0) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Process only in JSON — nothing to update in Supabase, but that's OK
      console.log(`Process "${slug}" not found in Supabase — may be JSON-only.`)
    } else {
      // Check creator authorization for non-admins
      const isCreator = session.user.email === updated[0].created_by
      if (!isAdmin && !isCreator) {
        // Roll back: restore original status
        await supabase.from('processes').update({ status: newStatus === 'archived' ? 'active' : 'archived' }).eq('slug', slug)
        return NextResponse.json({ error: 'Forbidden - only admin or creator' }, { status: 403 })
      }
    }

    // Optional: sync JSON file in local dev (silently ignored on Vercel)
    try {
      const fs = await import('fs')
      const path = await import('path')
      const jsonFilePath = path.join(process.cwd(), 'data', 'processes', `${slug}.json`)
      if (fs.existsSync(jsonFilePath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        jsonData.status = newStatus
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2))
      }
    } catch {
      // Read-only filesystem on Vercel — expected
    }

    const msg = action === 'archive'
      ? `Prozess archiviert`
      : `Prozess wiederhergestellt`

    return NextResponse.json({ success: true, message: msg })

  } catch (error) {
    console.error('Error in delete/restore:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
