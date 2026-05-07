import { NextRequest, NextResponse } from 'next/server'
import {
  sendDraftCreatedEmail,
  sendProcessApprovedEmail,
  sendProcessRejectedEmail,
} from '@/lib/emails'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, to, processTitle, processUrl, authorName, approverName, rejectionReason } = body

    if (!type || !to || !processTitle || !processUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'draft_created':
        if (!authorName) {
          return NextResponse.json(
            { error: 'authorName required for draft_created' },
            { status: 400 }
          )
        }
        result = await sendDraftCreatedEmail(to, processTitle, authorName, processUrl)
        break

      case 'process_approved':
        if (!approverName) {
          return NextResponse.json(
            { error: 'approverName required for process_approved' },
            { status: 400 }
          )
        }
        result = await sendProcessApprovedEmail(to, processTitle, processUrl, approverName)
        break

      case 'process_rejected':
        if (!rejectionReason || !approverName) {
          return NextResponse.json(
            { error: 'rejectionReason and approverName required for process_rejected' },
            { status: 400 }
          )
        }
        result = await sendProcessRejectedEmail(
          to,
          processTitle,
          rejectionReason,
          processUrl,
          approverName
        )
        break

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, id: result.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
