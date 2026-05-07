import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    console.log('[Draft] Session:', {
      exists: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email,
      name: session?.user?.name,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Generate ID and slug
    const processId = crypto.randomUUID()
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)

    // Insert process into Supabase
    const insertData = {
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
      created_by: session.user.email || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('[Draft] Inserting data:', {
      id: insertData.id,
      title: insertData.title,
      created_by: insertData.created_by,
      status: insertData.status,
    })

    const { data, error } = await supabase
      .from('processes')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Database error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          error: 'Failed to create process draft',
          debug: error.message
        },
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
