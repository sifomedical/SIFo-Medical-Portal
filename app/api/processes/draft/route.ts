import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Generate a URL-safe slug from a title, guaranteed unique against Supabase. */
async function uniqueSlug(title: string): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  // Check for collisions
  const { data: existing } = await supabase
    .from('processes')
    .select('slug')
    .ilike('slug', `${base}%`)

  if (!existing || existing.length === 0) return base

  const taken = new Set(existing.map((r: any) => r.slug))
  if (!taken.has(base)) return base

  // Append short timestamp suffix to avoid collision
  const suffix = Date.now().toString(36).slice(-4)
  return `${base.slice(0, 45)}-${suffix}`
}

/** Resolve the Supabase user UUID for the logged-in email. Creates the user if missing. */
async function resolveUserId(email: string, name?: string | null): Promise<string | null> {
  // Try to find existing user
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing?.id) return existing.id

  // Not found – create a minimal approved record so the FK is satisfied
  const { data: created, error } = await supabase
    .from('users')
    .insert([{
      email,
      name: name || email,
      status: 'approved',
    }])
    .select('id')
    .single()

  if (error) {
    console.error('[Draft] Could not create user record:', error.message)
    return null
  }

  return created?.id ?? null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()

    // 1. Resolve user UUID (FK constraint: created_by UUID REFERENCES users(id))
    const userId = await resolveUserId(session.user.email, session.user.name)
    if (!userId) {
      console.error('[Draft] Could not resolve userId for email:', session.user.email)
      return NextResponse.json(
        { error: 'Benutzer konnte nicht gefunden oder erstellt werden.' },
        { status: 500 }
      )
    }

    // 2. Build unique slug
    const processId = crypto.randomUUID()
    const slug = await uniqueSlug(body.title || 'prozess')

    // 3. Insert process
    const insertData = {
      id: processId,
      slug,
      title: body.title,
      subtitle: body.subtitle || '',
      category: body.category,
      description: body.description || '',
      purpose: body.purpose || '',
      scope: body.scope || '',
      responsibilities: body.responsibilities || [],
      definitions: body.definitions || {},
      inputs: body.inputs || [],
      steps: body.steps || [],
      risks_and_controls: body.risksAndControls || [],
      outputs: body.outputs || [],
      records: body.records || [],
      tools: body.tools || [],
      goals: body.goals || [],
      tags: body.tags || [],
      owner: body.owner || '',
      frequency: body.frequency || '',
      process_video_url: body.processVideoUrl || null,
      mermaid_diagram: body.mermaidDiagram || '',
      status: 'draft',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('[Draft] Inserting process:', {
      id: insertData.id,
      slug: insertData.slug,
      title: insertData.title,
      created_by: insertData.created_by,
    })

    const { data, error } = await supabase
      .from('processes')
      .insert([insertData])
      .select()

    if (error) {
      console.error('[Draft] Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: 'Failed to create process draft', debug: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: processId,
      slug,
      message: 'Process draft created successfully',
    })
  } catch (err) {
    console.error('[Draft] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
