import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { processId, fileName, fileType, fileSize, storagePath } = body

    if (!processId || !fileName || !fileType || !storagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save attachment metadata to database
    const { data, error } = await supabase
      .from('attachments')
      .insert([
        {
          process_id: processId,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize || 0,
          storage_path: storagePath,
          uploaded_by: '00000000-0000-0000-0000-000000000000', // System user for now
        },
      ])
      .select()

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ attachment: data?.[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const processId = req.nextUrl.searchParams.get('processId')

    if (!processId) {
      return NextResponse.json(
        { error: 'processId query parameter required' },
        { status: 400 }
      )
    }

    // Get attachments for process
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('process_id', processId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ attachments: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { attachmentId } = body

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'attachmentId required' },
        { status: 400 }
      )
    }

    // Delete attachment record
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId)

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
