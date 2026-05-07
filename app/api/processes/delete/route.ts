import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug, action } = await request.json()

    if (!slug || !action) {
      return NextResponse.json(
        { error: 'slug and action are required' },
        { status: 400 }
      )
    }

    // Get the process
    const { data: processData, error: fetchError } = await supabase
      .from('processes')
      .select('*')
      .eq('slug', slug)
      .single()

    if (fetchError || !processData) {
      return NextResponse.json(
        { error: 'Process not found' },
        { status: 404 }
      )
    }

    // Check authorization: only admin or creator can delete
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL
    const isCreator = session.user.email === processData.created_by

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Forbidden - only admin or creator can delete' },
        { status: 403 }
      )
    }

    const jsonFilePath = path.join(process.cwd(), 'data', 'processes', `${slug}.json`)

    if (action === 'archive') {
      // Soft delete: mark as archived in Supabase
      const { error: updateError } = await supabase
        .from('processes')
        .update({ status: 'archived' })
        .eq('slug', slug)

      if (updateError) {
        console.error('Error archiving process:', updateError)
        return NextResponse.json(
          { error: 'Failed to archive process' },
          { status: 500 }
        )
      }

      // Also update the JSON file so the local loader doesn't show it
      if (fs.existsSync(jsonFilePath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        jsonData.status = 'archived'
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2))
      }

      return NextResponse.json({
        success: true,
        message: `Process '${processData.title}' has been archived`,
      })
    } else if (action === 'restore') {
      // Restore from archive in Supabase
      const { error: updateError } = await supabase
        .from('processes')
        .update({ status: 'active' })
        .eq('slug', slug)

      if (updateError) {
        console.error('Error restoring process:', updateError)
        return NextResponse.json(
          { error: 'Failed to restore process' },
          { status: 500 }
        )
      }

      // Also update the JSON file
      if (fs.existsSync(jsonFilePath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        jsonData.status = 'active'
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2))
      }

      return NextResponse.json({
        success: true,
        message: `Process '${processData.title}' has been restored`,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "archive" or "restore"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting/restoring process:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
