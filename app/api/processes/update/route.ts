import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

    // Build Supabase update payload
    const supabaseUpdate: any = {
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
    }

    // Update in Supabase (only if process exists there)
    const { error: supabaseError } = await supabase
      .from('processes')
      .update(supabaseUpdate)
      .eq('slug', slug)

    if (supabaseError) {
      console.warn('Supabase update warning (may not exist):', supabaseError.message)
    }

    // Update the JSON file (primary data source for frontend)
    const jsonFilePath = path.join(process.cwd(), 'data', 'processes', `${slug}.json`)

    if (!fs.existsSync(jsonFilePath)) {
      return NextResponse.json({ error: 'Prozess-Datei nicht gefunden' }, { status: 404 })
    }

    const existingJson = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))

    const updatedJson = {
      ...existingJson,
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
      lastUpdated: new Date().toISOString(),
    }

    fs.writeFileSync(jsonFilePath, JSON.stringify(updatedJson, null, 2))

    return NextResponse.json({
      success: true,
      slug,
      category: updatedJson.category,
    })
  } catch (error) {
    console.error('Error updating process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
