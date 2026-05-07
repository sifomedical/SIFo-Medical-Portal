import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate ID and slug
    const processId = crypto.randomUUID()
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)

    // Get user from session (if available)
    const createdBy = body.createdBy || 'anonymous'

    // Insert process into Supabase
    const { data, error } = await supabase
      .from('processes')
      .insert([
        {
          id: processId,
          slug,
          title: body.title,
          subtitle: body.subtitle,
          category: body.category,
          description: body.description,
          purpose: body.purpose,
          scope: body.scope,
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
          owner: body.owner,
          frequency: body.frequency,
          process_video_url: body.processVideoUrl,
          mermaid_diagram: body.mermaidDiagram || '',
          status: 'draft',
          created_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create process draft' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: processId,
      slug,
      message: 'Process draft created successfully',
    })
  } catch (error) {
    console.error('Error creating process draft:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
