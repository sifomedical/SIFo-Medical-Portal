import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (session.user.email !== adminEmail) {
      return NextResponse.json({ error: 'Nur Admins können Prozesse bearbeiten' }, { status: 403 })
    }

    const body = await request.json()
    const { slug, ...processData } = body

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const now = new Date().toISOString()

    const supabasePayload: any = {
      title: processData.title,
      subtitle: processData.subtitle,
      description: processData.description,
      purpose: processData.purpose,
      scope: processData.scope,
      category: processData.category,
      responsibilities: processData.responsibilities,
      definitions: processData.definitions,
      inputs: processData.inputs,
      steps: processData.steps,
      risks_and_controls: processData.risksAndControls,
      outputs: processData.outputs,
      records: processData.records,
      tools: processData.tools,
      goals: processData.goals,
      tags: processData.tags,
      owner: processData.owner,
      frequency: processData.frequency,
      process_video_url: processData.processVideoUrl,
      mermaid_diagram: processData.mermaidDiagram,
      status: 'active',
      updated_at: now,
    }

    // Try UPDATE first
    const { data: updated, error: updateError } = await supabase
      .from('processes')
      .update(supabasePayload)
      .eq('slug', slug)
      .select()

    if (updateError) {
      console.error('Supabase update error:', updateError.message)
      return NextResponse.json({ error: 'Datenbankfehler beim Speichern' }, { status: 500 })
    }

    // If no row was updated, the process only exists in JSON → INSERT it into Supabase
    if (!updated || updated.length === 0) {
      console.log(`Process "${slug}" not in Supabase yet — inserting.`)
      const { error: insertError } = await supabase
        .from('processes')
        .insert([{ slug, ...supabasePayload, created_at: now }])

      if (insertError) {
        console.error('Supabase insert error:', insertError.message)
        return NextResponse.json({ error: 'Datenbankfehler beim Einfügen' }, { status: 500 })
      }
    }

    // Optional: update JSON file in local dev (silently ignored on Vercel)
    try {
      const fs = await import('fs')
      const path = await import('path')
      const jsonFilePath = path.join(process.cwd(), 'data', 'processes', `${slug}.json`)

      if (fs.existsSync(jsonFilePath)) {
        const existing = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        const updatedJson = {
          ...existing,
          ...Object.fromEntries(
            Object.entries({
              title: processData.title,
              subtitle: processData.subtitle,
              description: processData.description,
              purpose: processData.purpose,
              scope: processData.scope,
              category: processData.category,
              responsibilities: processData.responsibilities,
              definitions: processData.definitions,
              inputs: processData.inputs,
              steps: processData.steps,
              risksAndControls: processData.risksAndControls,
              outputs: processData.outputs,
              records: processData.records,
              tools: processData.tools,
              goals: processData.goals,
              tags: processData.tags,
              owner: processData.owner,
              frequency: processData.frequency,
              processVideoUrl: processData.processVideoUrl,
              mermaidDiagram: processData.mermaidDiagram,
              status: 'active',
              lastUpdated: now,
            }).filter(([, v]) => v !== undefined)
          ),
        }
        fs.writeFileSync(jsonFilePath, JSON.stringify(updatedJson, null, 2))
        console.log(`JSON file updated locally: ${slug}.json`)
      }
    } catch {
      // Read-only filesystem on Vercel — expected, not an error
    }

    return NextResponse.json({
      success: true,
      slug,
      category: processData.category,
    })
  } catch (error) {
    console.error('Error updating process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
